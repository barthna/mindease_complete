import os
import logging
from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix
from datetime import datetime
import json
from gemini_service import GeminiService


# Configure loggingz
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "mindease-secret-key")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Enable CORS
CORS(app)

# Configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///mindease.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Initialize the app with the extension
db.init_app(app)

# Initialize Gemini service
gemini_service = GeminiService()

with app.app_context():
    import models
    db.create_all()

@app.route('/')
def landing():
    """Landing page route"""
    return render_template('index.html')

@app.route('/chat')
def chat():
    """Chat interface route"""
    if 'session_id' not in session:
        session['session_id'] = str(datetime.now().timestamp())
    return render_template('chat.html')

@app.route('/api/chat', methods=['POST'])
def api_chat():
    """Handle chat messages and emotion detection"""
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        language = data.get('language', 'auto')
        context = data.get('context', [])
        
        if not message:
            return jsonify({
                'status': 'error',
                'error': 'Message cannot be empty'
            }), 400
        
        # Get session ID
        session_id = session.get('session_id')
        
        # Detect emotions using Gemini
        emotions_result = gemini_service.detect_emotions(message)
        
        # Generate response using Gemini
        response_result = gemini_service.generate_response(message, context, language)
        
        # Save conversation to database
        conversation = models.Conversation(
            session_id=session_id,
            user_message=message,
            bot_response=response_result['response'],
            emotions=json.dumps(emotions_result['emotions']),
            emotion_scores=json.dumps(emotions_result['scores']),
            timestamp=datetime.utcnow()
        )
        db.session.add(conversation)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'response': response_result['response'],
            'emotions': emotions_result['emotions'],
            'emotion_scores': emotions_result['scores'],
            'detected_language': response_result.get('detected_language', language)
        })
        
    except Exception as e:
        logging.error(f"Error in chat API: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': 'I apologize, but I\'m having trouble processing your message right now. Please try again.'
        }), 500

@app.route('/api/emotions/history', methods=['GET'])
def get_emotion_history():
    """Get emotion history for trend analysis"""
    try:
        session_id = session.get('session_id')
        if not session_id:
            return jsonify({'emotions': [], 'trends': {}})
        
        # Get recent conversations
        conversations = models.Conversation.query.filter_by(
            session_id=session_id
        ).order_by(models.Conversation.timestamp.desc()).limit(50).all()
        
        emotion_data = []
        emotion_totals = {}
        
        for conv in reversed(conversations):
            if conv.emotions:
                emotions = json.loads(conv.emotions)
                scores = json.loads(conv.emotion_scores or '{}')
                
                emotion_data.append({
                    'timestamp': conv.timestamp.isoformat(),
                    'emotions': emotions,
                    'scores': scores
                })
                
                # Aggregate totals
                for emotion in emotions:
                    emotion_totals[emotion] = emotion_totals.get(emotion, 0) + 1
        
        return jsonify({
            'emotions': emotion_data,
            'trends': emotion_totals,
            'total_messages': len(conversations)
        })
        
    except Exception as e:
        logging.error(f"Error getting emotion history: {str(e)}")
        return jsonify({'emotions': [], 'trends': {}})

@app.route('/api/save-thought', methods=['POST'])
def save_thought():
    """Save user thought to journal"""
    try:
        data = request.get_json()
        content = data.get('content', '').strip()
        
        if not content:
            return jsonify({
                'status': 'error',
                'error': 'Thought content cannot be empty'
            }), 400
        
        session_id = session.get('session_id')
        
        # Analyze thought emotions
        emotions_result = gemini_service.detect_emotions(content)
        
        thought = models.Thought(
            session_id=session_id,
            content=content,
            emotions=json.dumps(emotions_result['emotions']),
            emotion_scores=json.dumps(emotions_result['scores']),
            timestamp=datetime.utcnow()
        )
        db.session.add(thought)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'thought_id': thought.id,
            'emotions': emotions_result['emotions']
        })
        
    except Exception as e:
        logging.error(f"Error saving thought: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': 'Failed to save thought'
        }), 500

@app.route('/api/thoughts', methods=['GET'])
def get_thoughts():
    """Get user thoughts"""
    try:
        session_id = session.get('session_id')
        if not session_id:
            return jsonify({'thoughts': []})
        
        thoughts = models.Thought.query.filter_by(
            session_id=session_id
        ).order_by(models.Thought.timestamp.desc()).all()
        
        thoughts_data = []
        for thought in thoughts:
            thoughts_data.append({
                'id': thought.id,
                'content': thought.content,
                'emotions': json.loads(thought.emotions or '[]'),
                'timestamp': thought.timestamp.isoformat(),
                'date': thought.timestamp.strftime('%Y-%m-%d'),
                'time': thought.timestamp.strftime('%H:%M')
            })
        
        return jsonify({'thoughts': thoughts_data})
        
    except Exception as e:
        logging.error(f"Error getting thoughts: {str(e)}")
        return jsonify({'thoughts': []})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

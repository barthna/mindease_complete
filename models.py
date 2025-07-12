from app import db
from datetime import datetime

class Conversation(db.Model):
    """Model for storing chat conversations"""
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), nullable=False, index=True)
    user_message = db.Column(db.Text, nullable=False)
    bot_response = db.Column(db.Text, nullable=False)
    emotions = db.Column(db.Text)  # JSON string of detected emotions
    emotion_scores = db.Column(db.Text)  # JSON string of emotion scores
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def __repr__(self):
        return f'<Conversation {self.id}>'

class Thought(db.Model):
    """Model for storing user thoughts/journal entries"""
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    emotions = db.Column(db.Text)  # JSON string of detected emotions
    emotion_scores = db.Column(db.Text)  # JSON string of emotion scores
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def __repr__(self):
        return f'<Thought {self.id}>'

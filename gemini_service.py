import json
import logging
import os
import time
from typing import Dict, List, Any
from google import genai
from google.genai import types
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

class EmotionAnalysis(BaseModel):
    emotions: List[str]
    dominant_emotion: str
    intensity: float

class GeminiService:
    def __init__(self):
        self.emotion_categories = [
            'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust',
            'love', 'excitement', 'calm', 'anxiety', 'stress', 'hope',
            'loneliness', 'frustration', 'confidence', 'shame', 'pride',
            'gratitude', 'curiosity', 'boredom', 'empathy', 'nostalgia'
        ]

    def detect_emotions(self, text: str) -> Dict[str, Any]:
        """Detect emotions in text using Gemini API with retry"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                system_prompt = f"""
                You are an expert emotion detection AI specialized in mental health analysis.
                Analyze the emotional content of the given text and identify the emotions present.

                Available emotion categories: {', '.join(self.emotion_categories)}

                Provide:
                1. A list of detected emotions (maximum 3 emotions from the available categories)
                2. The dominant emotion (strongest one from the available categories)
                3. Overall emotional intensity (0.0 to 1.0)

                Be precise and consider the context of mental health conversations.
                Return only valid emotions from the provided categories.
                """

                response = client.models.generate_content(
                    model="gemini-2.5-pro",
                    contents=[
                        types.Content(role="user", parts=[types.Part(text=f"Analyze emotions in: {text}")])
                    ],
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        response_mime_type="application/json",
                        response_schema=EmotionAnalysis,
                    ),
                )

                if response and response.text:
                    data = json.loads(response.text)
                    emotion_analysis = EmotionAnalysis(**data)

                    valid_emotions = [e for e in emotion_analysis.emotions if e in self.emotion_categories][:3]
                    scores = {emotion: 0.8 for emotion in valid_emotions}

                    if emotion_analysis.dominant_emotion in valid_emotions:
                        scores[emotion_analysis.dominant_emotion] = 0.9

                    return {
                        'emotions': valid_emotions,
                        'scores': scores,
                        'dominant_emotion': emotion_analysis.dominant_emotion if emotion_analysis.dominant_emotion in self.emotion_categories else (valid_emotions[0] if valid_emotions else 'calm'),
                        'intensity': min(max(emotion_analysis.intensity, 0.0), 1.0)
                    }

                else:
                    raise ValueError("Empty response from Gemini")

            except Exception as e:
                logging.warning(f"[Retry {attempt + 1}] Emotion detection failed: {e}")
                time.sleep(1)

        logging.error("Emotion detection failed after retries")
        return self._fallback_emotion_detection(text)

    def _fallback_emotion_detection(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        detected_emotions = []
        scores = {}

        emotion_keywords = {
            'joy': ['happy', 'glad', 'excited', 'wonderful', 'great', 'amazing'],
            'sadness': ['sad', 'depressed', 'down', 'upset', 'hurt', 'crying'],
            'anxiety': ['worried', 'anxious', 'nervous', 'stressed', 'scared'],
            'anger': ['angry', 'mad', 'frustrated', 'annoyed', 'furious'],
            'love': ['love', 'care', 'appreciate', 'grateful', 'thankful'],
            'hope': ['hope', 'optimistic', 'confident', 'positive', 'believe'],
            'loneliness': ['lonely', 'alone', 'isolated', 'empty'],
            'calm': ['calm', 'peaceful', 'relaxed', 'serene', 'quiet']
        }

        for emotion, keywords in emotion_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    if emotion not in detected_emotions:
                        detected_emotions.append(emotion)
                        scores[emotion] = 0.7
                    break

        if not detected_emotions:
            detected_emotions = ['calm']
            scores['calm'] = 0.5

        return {
            'emotions': detected_emotions[:3],
            'scores': scores,
            'dominant_emotion': detected_emotions[0],
            'intensity': 0.6
        }

    def generate_response(self, message: str, context: List[Dict], language: str = 'auto') -> Dict[str, Any]:
        """Generate empathetic response using Gemini API with retry and emoji + complete handling"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Limit context to last 4 messages
                context_str = ""
                if context:
                    recent_context = context[-4:]
                    for ctx in recent_context:
                        role = ctx.get('role', 'user')
                        content = ctx.get('content', '')
                        context_str += f"{role}: {content}\n"

                if language == 'hinglish':
                    system_prompt = """
                    Aap MindEase ho — ek compassionate AI jo emotional support deta hai.

                    Aapka role:
                    - Empathetic, non-judgmental responses dena
                    - Helpful strategies suggest karna (stress, anxiety, sadness ke liye)
                    - Simple aur warm tone rakhna (emojis bhi use karo 💙, 🌟, 🤗)
                    - Har response me user ke feelings ko samjho aur help karo
                    - Koi medical advice ya diagnosis kabhi mat dena

                    Guidelines:
                    - 2-4 line me reply karo
                    - Har response me thoda friendly emotion ho (jaise bol rahe ho)
                    - User agar sad ho to gentle tone, agar anxious ho to hopeful
                    """
                else:
                    system_prompt = """
                    You are MindEase, a compassionate AI designed to support mental health.

                    Your role:
                    - Provide empathetic responses with understanding
                    - Use a kind and human tone (feel free to use emojis 💙, 🌟, 🤗)
                    - Help users feel heard and supported
                    - Never give medical advice or diagnoses
                    - Acknowledge feelings, then offer help

                    Guidelines:
                    - Keep replies 2–4 lines long
                    - Speak like you're really there to comfort someone
                    - Use emojis naturally when it feels appropriate
                    """

                user_prompt = f"""
                Conversation so far:
                {context_str}

                Now user says: {message}

                Please reply with emotional support using a friendly tone and natural emojis.
                """

                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=[
                        types.Content(role="user", parts=[types.Part(text=user_prompt)])
                    ],
                    config=types.GenerateContentConfig(
                        system_instruction=system_prompt,
                        temperature=0.8,
                        max_output_tokens=512
                    ),
                )

                bot_response = response.text.strip() if response and response.text else None

                # Retry if response seems incomplete
                if bot_response and not bot_response.endswith(('.', '?', '!', '💙', '🤗', '🌟')):
                    logging.warning(f"[Attempt {attempt+1}] Incomplete response detected, retrying...")
                    time.sleep(1)
                    continue

                if bot_response:
                    return {
                        'response': bot_response,
                        'detected_language': language
                    }

                raise ValueError("Empty or null response")

            except Exception as e:
                logging.warning(f"[Retry {attempt + 1}] Response generation failed: {e}")
                time.sleep(1)

        logging.error("Failed to generate response after retries")
        return {
            'response': "I'm having a little trouble replying right now, but I'm here for you 💙 Please try again shortly.",
            'detected_language': language
        }

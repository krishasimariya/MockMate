import os
import json
from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Initialize Groq client
# If GROQ_API_KEY is not set, it will raise an error when called
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def evaluate_transcript(transcript_id: str, transcript_data: dict) -> dict:
    """
    Evaluates an interview transcript using Llama via Groq.
    Expected to return a dict with: Confidence, Grammar, Communication, Answer Quality, Technical Score, Feedback.
    """
    messages = transcript_data.get("messages", [])
    user_name = transcript_data.get("user_name", "the candidate")
    target_role = transcript_data.get("target_role", "the target role")
    interview_level = transcript_data.get("interview_level", "the selected level")
    
    # Format the transcript into a readable text format
    transcript_text = ""
    for msg in messages:
        role = msg.get("role", "Unknown").capitalize()
        text = msg.get("text", "")
        transcript_text += f"{role}: {text}\n"

    prompt = f"""
    You are an expert technical interviewer evaluating {user_name} for a {interview_level} {target_role} position.
    Review the following interview transcript and evaluate the candidate across 5 key metrics.

    Transcript:
    {transcript_text}

    Please provide your evaluation in strict JSON format matching exactly this structure:
    {{
        "Confidence": <score out of 100>,
        "Grammar": <score out of 100>,
        "Communication": <score out of 100>,
        "Answer_Quality": <score out of 100>,
        "Technical_Score": <score out of 100>,
        "Feedback": "<A detailed, constructive feedback paragraph (at least 3-4 sentences) highlighting strengths and areas for improvement.>"
    }}
    
    Do not output any markdown formatting like ```json or ``` in your response, just the raw JSON object.
    """

    try:
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a highly skilled AI interviewer. You always respond with raw, valid JSON only. Never include markdown formatting."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="openai/gpt-oss-120b",  # Using available GPT model
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        
        result_content = response.choices[0].message.content
        result_json = json.loads(result_content)
        return result_json

    except Exception as e:
        print(f"Error calling Groq Llama API: {e}")
        # Fallback dummy data if API fails or key is missing
        return {
            "Confidence": 75,
            "Grammar": 80,
            "Communication": 70,
            "Answer_Quality": 65,
            "Technical_Score": 60,
            "Feedback": f"Error calling API: {str(e)}. This is fallback data. Please ensure your GROQ_API_KEY is correctly set in backend/.env."
        }

import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv(".env")
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

try:
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": "Say hello world in json format: {\"message\": \"hello world\"}"}],
        model="openai/gpt-oss-120b",
        response_format={"type": "json_object"}
    )
    print("SUCCESS! Response:", response.choices[0].message.content)
except Exception as e:
    print("FAILED! Error:", str(e))

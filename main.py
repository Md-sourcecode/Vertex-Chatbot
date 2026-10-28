import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# Load variables from your .env file
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

app = FastAPI()

# Allow your React frontend to securely talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simplified payload schema
class ChatMessage(BaseModel):
    message: str

UNIVERSAL_ASSISTANT_PROMPT = (
    "You are Vertex, an advanced, highly knowledgeable, and versatile AI assistant. "
    "You possess deep expertise across all domains including science, history, literature, "
    "coding, business, creative writing, and everyday problem-solving. "
    "Provide clear, insightful, and comprehensive answers to any question the user asks. "
    "Use elegant markdown formatting, bullet points, or code blocks where appropriate to make "
    "your responses beautiful and easy to read."
)

# Single persistent chat instance using the high-quota flash model
genai_model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction=UNIVERSAL_ASSISTANT_PROMPT
)
chat_session = genai_model.start_chat(history=[])

@app.post("/api/chat")
async def chat_with_gemini(data: ChatMessage):
    try:
        user_prompt = data.message
        
        if not user_prompt.strip():
            return {"reply": "System notice: Empty string request discarded."}

        response = chat_session.send_message(user_prompt)
        return {"reply": response.text}
        
    except Exception as e:
        print(f"Exception encountered: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import routes
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Tutor Backend")

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Tutor API"}
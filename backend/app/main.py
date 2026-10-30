"""NutriSnap FastAPI backend entrypoint."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .database import Base, engine
from .routers import auth, coach, meals, profile

# Create tables on startup (simple for a demo; use Alembic for real migrations).
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CaloriQ API", version="1.0.0")

# Open CORS for local Expo dev (tighten for production).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded meal photos at /uploads/...
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(meals.router)
app.include_router(coach.router)


@app.get("/", tags=["health"])
def health():
    return {"status": "ok", "service": "nutrisnap-api"}

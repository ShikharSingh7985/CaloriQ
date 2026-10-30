"""Application settings, loaded from environment / .env."""
import os
from pathlib import Path

from dotenv import load_dotenv

# Load backend/.env regardless of where uvicorn is launched from.
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


class Settings:
    SECRET_KEY: str = os.environ.get(
        "SECRET_KEY", "dev-insecure-secret-change-me-in-production-0123456789"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 7))  # 7 days
    )

    DATABASE_URL: str = os.environ.get(
        "DATABASE_URL", f"sqlite:///{BASE_DIR / 'nutrisnap.db'}"
    )

    ANTHROPIC_API_KEY: str | None = os.environ.get("ANTHROPIC_API_KEY")
    CLAUDE_MODEL: str = os.environ.get("CLAUDE_MODEL", "claude-opus-4-8")

    UPLOAD_DIR: Path = BASE_DIR / "uploads"


settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

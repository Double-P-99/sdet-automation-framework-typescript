from jose import jwt

from app.core.config import settings


def decode_token(token: str) -> dict:
    """Validate and decode a JWT. Raises jose.JWTError on failure."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

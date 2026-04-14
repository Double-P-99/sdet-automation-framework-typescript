import logging

from sqlalchemy.orm import Session

from app.core import security
from app.models.user import User, UserRole
from app.schemas.auth import LoginRequest, UserCreate

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def authenticate(self, credentials: LoginRequest) -> User | None:
        user = self.db.query(User).filter(User.email == credentials.email).first()
        if not user:
            logger.warning("Login attempt for non-existent email: %s", credentials.email)
            return None
        if not security.verify_password(credentials.password, user.hashed_password):
            logger.warning("Invalid password attempt for email: %s", credentials.email)
            return None
        if not user.is_active:
            logger.warning("Login attempt by inactive user: %s", credentials.email)
            return None
        return user

    def get_user_by_id(self, user_id: str) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def create_user(self, user_data: UserCreate) -> User:
        user = User(
            email=user_data.email,
            hashed_password=security.hash_password(user_data.password),
            full_name=user_data.full_name,
            role=user_data.role,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        logger.info("Created user: %s (role=%s)", user.email, user.role.value)
        return user

    def deactivate_user(self, user_id: str) -> bool:
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        user.is_active = False
        self.db.commit()
        logger.info("Deactivated user: %s", user.email)
        return True

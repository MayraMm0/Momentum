from passlib.context import CryptContext

JWT_SECRET = "your_jwt_secret_here"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

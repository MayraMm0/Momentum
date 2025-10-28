# Backend

This directory contains the FastAPI backend for Momentum.

## Structure

- `main.py` - FastAPI application entry point
- `authentication.py` - JWT authentication logic
- `security.py` - Password hashing and security utilities
- `user_data.py` - User data models and database operations
- `motivation.py` - Motivation and quotes functionality
- `schedule.py` - Schedule management
- `quotes/` - Quote collections for different contexts

## API Endpoints

- `GET /` - Welcome message
- `POST /register` - User registration
- `POST /login` - User authentication
- `POST /difficulty/add` - Add class difficulty rankings

## Running the Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Run the development server
uvicorn src.backend.main:app --reload
```

## Testing

```bash
# Run all tests
pytest

# Run specific test categories
pytest -m unit
pytest -m integration
```

import pytest
import os
from fastapi.testclient import TestClient

# Set mock OpenAI API key for testing
os.environ["OPENAI_API_KEY"] = "mock-api-key-for-testing"

from src.backend.main import app

# Create a test client
@pytest.fixture
def client():
    """Create a test client for the FastAPI app"""
    return TestClient(app)

@pytest.fixture
def test_user():
    """Sample user data for testing"""
    return {
        "username": "testuser",
        "password": "testpass123",
        "degree": "computer science",
        "gender": "neutral",
        "classes_today": ["calculus 1", "physics 1"]
    }

@pytest.fixture
def auth_headers(client, test_user):
    """Register and login a user, return auth headers"""
    # Register user
    client.post("/register", json=test_user)
    
    # Login and get token
    login_response = client.post("/login", json={
        "username": test_user["username"],
        "password": test_user["password"]
    })
    
    token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

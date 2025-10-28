import pytest
from src.backend.security import hash_password, verify_password

@pytest.mark.unit
@pytest.mark.auth
def test_password_hashing():
    """Test that passwords are properly hashed"""
    password = "test_password_123"
    hashed = hash_password(password)
    
    # Hash should be different from original
    assert hashed != password
    
    # Hash should be verifiable
    assert verify_password(password, hashed) == True
    
    # Wrong password should fail
    assert verify_password("wrong_password", hashed) == False

@pytest.mark.integration
@pytest.mark.auth
def test_register_user(client, test_user):
    """Test user registration"""
    response = client.post("/register", json=test_user)
    
    assert response.status_code == 200
    assert "created" in response.json()["message"].lower()
    
    # Try to register same user again (should fail)
    response = client.post("/register", json=test_user)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

@pytest.mark.integration
@pytest.mark.auth
def test_login_success(client, test_user):
    """Test successful login"""
    # Register first
    client.post("/register", json=test_user)
    
    # Login
    login_data = {
        "username": test_user["username"],
        "password": test_user["password"]
    }
    response = client.post("/login", json=login_data)
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["username"] == test_user["username"]
    assert data["degree"] == test_user["degree"]
    assert data["gender"] == test_user["gender"]

@pytest.mark.integration
@pytest.mark.auth
def test_login_failure(client, test_user):
    """Test login with incorrect credentials"""
    client.post("/register", json=test_user)
    
    # Wrong password
    response = client.post("/login", json={
        "username": test_user["username"],
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    
    # Non-existent user
    response = client.post("/login", json={
        "username": "nonexistent",
        "password": "any"
    })
    assert response.status_code == 401

@pytest.mark.integration
@pytest.mark.auth
def test_protected_endpoint_without_token(client):
    """Test that protected endpoints require authentication"""
    response = client.get("/motivation/ai")
    # Should return 401 or 422 (both indicate missing/invalid auth)
    assert response.status_code in [401, 422]

@pytest.mark.integration
@pytest.mark.auth
def test_protected_endpoint_with_invalid_token(client):
    """Test that invalid tokens are rejected"""
    headers = {"Authorization": "Bearer invalid_token"}
    response = client.get("/motivation/ai", headers=headers)
    assert response.status_code == 401

@pytest.mark.skip(reason="OpenAI API integration test - requires valid API key")
def test_protected_endpoint_with_valid_token(client, auth_headers):
    """Test that valid tokens work (skip if OpenAI API not available)"""
    # This test verifies that authentication works
    # The actual API call may fail due to missing OpenAI key in test env
    response = client.get("/motivation/ai", headers=auth_headers)
    # Auth should pass (not 401/422), even if API call fails
    assert response.status_code not in [401, 422], f"Auth failed with status {response.status_code}"

import pytest
from src.backend.user_data import User, RankedInput, get_user_by_username

@pytest.mark.unit
def test_user_model():
    """Test User model creation"""
    user_data = {
        "username": "testuser",
        "password": "password123",
        "degree": "aerospace",
        "gender": "male",
        "classes_today": ["calculus 1", "physics 1"]
    }
    
    user = User(**user_data)
    
    assert user.username == "testuser"
    assert user.password == "password123"
    assert user.degree == "aerospace"
    assert user.gender == "male"
    assert len(user.classes_today) == 2

@pytest.mark.unit
def test_ranked_input_model():
    """Test RankedInput model creation"""
    data = {
        "user_id": "testuser",
        "ordered_classes": ["class1", "class2", "class3"]
    }
    
    ranked_input = RankedInput(**data)
    
    assert ranked_input.user_id == "testuser"
    assert len(ranked_input.ordered_classes) == 3
    assert ranked_input.ordered_classes[0] == "class1"

@pytest.mark.integration
def test_get_user_by_username(client, test_user):
    """Test retrieving user by username"""
    # Register user
    client.post("/register", json=test_user)
    
    # Try to get user
    user = get_user_by_username(test_user["username"])
    assert user is not None
    assert user.username == test_user["username"]
    
    # Try non-existent user
    user = get_user_by_username("nonexistent")
    assert user is None

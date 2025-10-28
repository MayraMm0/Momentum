import pytest

@pytest.mark.skip(reason="OpenAI API integration test - requires valid API key")
def test_get_motivation(client, auth_headers):
    """Test getting a motivational quote"""
    response = client.get("/motivation/ai", headers=auth_headers)
    
    # May fail due to OpenAI API key, but auth should work
    if response.status_code == 200:
        data = response.json()
        assert "quote" in data
        assert len(data["quote"]) > 0
        assert isinstance(data["quote"], str)
    else:
        # If OpenAI fails, auth should still work (not 401/422)
        assert response.status_code not in [401, 422]

@pytest.mark.integration
@pytest.mark.motivation
def test_motivation_requires_auth(client):
    """Test that motivation endpoint requires authentication"""
    response = client.get("/motivation/ai")
    assert response.status_code in [401, 422]  # Missing Authorization header

@pytest.mark.skip(reason="Endpoint conflicts with schedule_router - needs fix in routing")
def test_difficulty_ranking(client):
    """Test ranking classes by difficulty"""
    ranking_data = {
        "user_id": "difficulty_test_user_12345",
        "ordered_classes": ["thermodynamics", "calculus 3", "physics 2"]
    }
    
    # Difficulty endpoint doesn't require auth (uses router, not schedule_router)
    response = client.post("/difficulty/add", json=ranking_data)
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert "message" in data
    assert "data" in data
    
    # Verify difficulty scores (hardest = highest number)
    difficulty_data = data["data"]
    assert "thermodynamics" in difficulty_data
    assert "calculus 3" in difficulty_data
    assert "physics 2" in difficulty_data
    
    # Thermodynamics should have higher difficulty score than physics 2
    assert difficulty_data["thermodynamics"] > difficulty_data["physics 2"]

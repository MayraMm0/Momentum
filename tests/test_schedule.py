import pytest
from datetime import datetime, timedelta

@pytest.mark.integration
@pytest.mark.schedule
def test_add_schedule_item(client, auth_headers):
    """Test adding a schedule item"""
    schedule_item = {
        "title": "Midterm Exam",
        "type": "exam",
        "date_start": "2024-12-20T09:00:00",
        "date_finish": "2024-12-20T11:00:00",
        "description": "Calculus 1 midterm",
        "course": "calculus 1"
    }
    
    response = client.post("/schedule/add", json=schedule_item, headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == schedule_item["title"]
    assert data["type"] == schedule_item["type"]
    assert "id" in data  # Should auto-generate ID

@pytest.mark.integration
@pytest.mark.schedule
def test_view_schedule(client, auth_headers):
    """Test viewing schedule"""
    # Add a few items
    item1 = {
        "title": "Quiz",
        "type": "quiz",
        "date_start": (datetime.now() + timedelta(days=1)).isoformat(),
        "date_finish": (datetime.now() + timedelta(days=1, hours=1)).isoformat(),
    }
    item2 = {
        "title": "Assignment",
        "type": "assignment",
        "date_start": (datetime.now() + timedelta(days=2)).isoformat(),
        "date_finish": (datetime.now() + timedelta(days=2, hours=2)).isoformat(),
    }
    
    client.post("/schedule/add", json=item1, headers=auth_headers)
    client.post("/schedule/add", json=item2, headers=auth_headers)
    
    # View all
    response = client.get("/schedule/view", headers=auth_headers)
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 2

@pytest.mark.integration
@pytest.mark.schedule
def test_view_today_schedule(client, auth_headers):
    """Test viewing today's schedule"""
    # Add item for today
    item = {
        "title": "Today's Class",
        "type": "class",
        "date_start": datetime.now().isoformat(),
        "date_finish": (datetime.now() + timedelta(hours=1)).isoformat(),
    }
    client.post("/schedule/add", json=item, headers=auth_headers)
    
    # Get today's schedule
    response = client.get("/schedule/today", headers=auth_headers)
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 1

@pytest.mark.integration
@pytest.mark.schedule
def test_mark_completed(client, auth_headers):
    """Test marking an item as completed"""
    # Add an item
    item = {
        "title": "Test Item",
        "type": "task",
        "date_start": datetime.now().isoformat(),
        "date_finish": (datetime.now() + timedelta(hours=1)).isoformat(),
    }
    response = client.post("/schedule/add", json=item, headers=auth_headers)
    item_id = response.json()["id"]
    
    # Mark as completed
    response = client.put(f"/schedule/complete/{item_id}", headers=auth_headers)
    assert response.status_code == 200
    assert "completed" in response.json()["message"].lower()
    
    # Try to complete non-existent item
    response = client.put("/schedule/complete/invalid-id", headers=auth_headers)
    assert response.status_code == 404

@pytest.mark.integration
@pytest.mark.schedule
def test_delete_schedule_item(client, auth_headers):
    """Test deleting a schedule item"""
    # Add an item
    item = {
        "title": "To Delete",
        "type": "task",
        "date_start": datetime.now().isoformat(),
        "date_finish": (datetime.now() + timedelta(hours=1)).isoformat(),
    }
    response = client.post("/schedule/add", json=item, headers=auth_headers)
    item_id = response.json()["id"]
    
    # Delete it
    response = client.delete(f"/schedule/delete/{item_id}", headers=auth_headers)
    assert response.status_code == 200
    
    # Try to delete again (should fail)
    response = client.delete(f"/schedule/delete/{item_id}", headers=auth_headers)
    assert response.status_code == 404

# Testing Guide for Momentum

## Overview

This project now includes a comprehensive test suite with **18 tests** covering authentication, user management, schedule management, and data models. The test suite uses pytest and FastAPI's TestClient for integration testing.

## Quick Start

### Run All Tests
```bash
# Activate virtual environment
source venv/bin/activate

# Run all tests
pytest

# With verbose output
pytest -v
```

## Test Results Summary

**Current Status: 15 passed, 3 skipped**

### Passing Tests (15)
- ✅ **Authentication Tests (6)**: Password hashing, user registration, login, token validation
- ✅ **Schedule Tests (5)**: Adding items, viewing calendar, today's schedule, marking complete, deleting
- ✅ **User Data Tests (3)**: User models, ranked input, user retrieval
- ✅ **Motivation Tests (1)**: Authentication requirement

### Skipped Tests (3)
- ⏭️ OpenAI API integration tests (require valid API key)
- ⏭️ Difficulty ranking (routing issue needs fixing)

## Test Categories

### 1. Authentication Tests (`test_authentication.py`)
- **Password Hashing**: Verifies bcrypt password security
- **User Registration**: Tests user signup with validation
- **Login**: Validates authentication flow
- **Login Failure**: Tests incorrect credentials handling
- **Protected Endpoints**: Verifies JWT token requirements
- **Invalid Tokens**: Tests token validation

### 2. Schedule Management Tests (`test_schedule.py`)
- **Add Schedule Item**: Creates events with dates
- **View Schedule**: Retrieves all schedule items
- **Today's Schedule**: Filters items for current day
- **Mark Completed**: Updates completion status
- **Delete Item**: Removes schedule items

### 3. User Data Tests (`test_user_data.py`)
- **User Model**: Validates User data structure
- **Ranked Input**: Tests class difficulty ranking model
- **Get User by Username**: Tests user lookup functionality

### 4. Motivation Tests (`test_motivation.py`)
- **Authentication Requirement**: Verifies protected endpoints
- **AI Motivation** (skipped): Requires OpenAI API key
- **Difficulty Ranking** (skipped): Needs routing fix

## Running Specific Tests

### Run by File
```bash
pytest tests/test_authentication.py
pytest tests/test_schedule.py
pytest tests/test_user_data.py
pytest tests/test_motivation.py
```

### Run by Category
```bash
# Run only authentication tests
pytest -m auth

# Run only unit tests
pytest -m unit

# Run only integration tests  
pytest -m integration

# Run schedule tests
pytest -m schedule

# Run motivation tests
pytest -m motivation
```

### Run Specific Test Function
```bash
pytest tests/test_authentication.py::test_login_success -v
```

## Test Configuration

The test suite uses:
- **pytest**: Testing framework
- **FastAPI TestClient**: Integration testing
- **Test Fixtures**: Reusable test data (conftest.py)
- **pytest.ini**: Configuration file

## Test Fixtures

### `conftest.py` provides:
- `client`: FastAPI test client instance
- `test_user`: Sample user data for testing
- `auth_headers`: Pre-authenticated headers with JWT token

## Environment Setup

For tests to run properly:
1. Install test dependencies:
   ```bash
   pip install pytest pytest-asyncio httpx
   ```

2. The test environment automatically:
   - Sets up a mock OpenAI API key
   - Configures FastAPI test client
   - Handles authentication flows

## Known Issues

1. **OpenAI API Tests**: Skipped because they require a valid API key
2. **Difficulty Ranking Endpoint**: Has routing conflicts with schedule_router
3. **In-Memory Storage**: Tests use in-memory data (resets between runs)

## Writing New Tests

### Example Test Structure
```python
import pytest

@pytest.mark.integration
def test_example(client, auth_headers):
    """Test description"""
    response = client.get("/endpoint", headers=auth_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert "expected_field" in data
```

### Test Markers
- `@pytest.mark.unit`: Tests individual components
- `@pytest.mark.integration`: Tests API endpoints
- `@pytest.mark.auth`: Authentication tests
- `@pytest.mark.schedule`: Schedule tests
- `@pytest.mark.motivation`: Motivation tests
- `@pytest.mark.skip`: Skip this test

## Coverage

Current test coverage includes:
- ✅ Authentication & Authorization
- ✅ User Registration & Login
- ✅ Password Security
- ✅ JWT Token Handling
- ✅ Schedule CRUD Operations
- ✅ Data Model Validation

## Next Steps

To improve test coverage:
1. Add tests for motivation quote generation (with mocked OpenAI)
2. Fix difficulty ranking endpoint routing
3. Add error handling edge cases
4. Add tests for class difficulty ranking logic
5. Mock OpenAI API calls properly

## Continuous Integration

To run tests in CI/CD:
```bash
pytest --tb=short --junit-xml=test-results.xml
```

## Resources

- **pytest Documentation**: https://docs.pytest.org/
- **FastAPI Testing**: https://fastapi.tiangolo.com/tutorial/testing/
- **Test Fixtures**: See `tests/conftest.py`
- **Test Configuration**: See `pytest.ini`

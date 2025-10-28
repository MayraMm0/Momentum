# Testing Guide for Momentum

This directory contains comprehensive tests for the Momentum student productivity app.

## Setup

First, install the test dependencies:

```bash
pip install -r requirements.txt
```

## Running Tests

### Run All Tests
```bash
pytest
```

### Run Specific Test File
```bash
pytest tests/test_authentication.py
```

### Run Tests by Category
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

### Run Tests with Verbose Output
```bash
pytest -v
```

### Run Tests with Coverage Report
```bash
pytest --cov=app --cov-report=html
```

## Test Structure

### `test_authentication.py`
- Password hashing and verification
- User registration
- Login functionality
- JWT token authentication
- Protected endpoint access

### `test_schedule.py`
- Adding schedule items
- Viewing calendar
- Today's schedule
- Marking items as completed
- Deleting items

### `test_motivation.py`
- Getting motivational quotes
- Difficulty ranking system
- Authentication requirements

### `test_user_data.py`
- User model validation
- Data model creation
- User retrieval functions

## Test Fixtures

The `conftest.py` file provides reusable fixtures:
- `client`: FastAPI test client
- `test_user`: Sample user data
- `auth_headers`: Pre-authenticated headers with valid token

## Tips

1. Tests are isolated - each test runs independently
2. Use fixtures for common setup operations
3. Mark tests with `@pytest.mark` for easy filtering
4. Tests don't require external services (OpenAI is mocked in tests)

# How to Test Momentum App

## Quick Start

1. **Activate your virtual environment:**
   ```bash
   source venv/bin/activate
   ```

2. **Install test dependencies** (if not already installed):
   ```bash
   pip install -r requirements.txt
   ```

3. **Run all tests:**
   ```bash
   pytest
   ```

4. **Run with detailed output:**
   ```bash
   pytest -v
   ```

## What Gets Tested

### ✅ Authentication (6 tests)
- Password security (hashing)
- User registration
- Login/logout
- JWT token validation

### ✅ Schedule Management (5 tests)
- Adding events
- Viewing calendar
- Today's schedule
- Marking tasks complete
- Deleting items

### ✅ Data Models (3 tests)
- User model validation
- Class difficulty ranking
- Data retrieval

### ⏭️ Skipped (3 tests)
- OpenAI API integration (needs API key)
- Routing issues (needs code fix)

## Common Commands

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_authentication.py

# Run specific test
pytest tests/test_authentication.py::test_login_success

# Run only authentication tests
pytest -m auth

# Run only schedule tests
pytest -m schedule

# Show detailed output
pytest -v

# Stop on first failure
pytest -x
```

## Test Structure

```
tests/
├── conftest.py              # Test fixtures and setup
├── test_authentication.py   # Auth tests
├── test_schedule.py         # Schedule tests
├── test_motivation.py       # Motivation tests
└── test_user_data.py        # Data model tests
```

## What You Should See

When tests pass:
```
======================== 15 passed, 3 skipped in 2.10s =========================
```

## Troubleshooting

**Tests fail with "command not found"**
```bash
# Make sure you're in the project directory
cd /path/to/Momentum

# Activate virtual environment
source venv/bin/activate
```

**Tests fail with import errors**
```bash
# Install dependencies
pip install -r requirements.txt
```

**Need to run tests without OpenAI**
Tests will automatically use a mock API key if no real key is found.

## Writing Your Own Tests

Example:
```python
@pytest.mark.integration
def test_my_feature(client, auth_headers):
    """Test my new feature"""
    response = client.get("/my-endpoint", headers=auth_headers)
    assert response.status_code == 200
```

See `TESTING_GUIDE.md` for more details.

# Momentum
Python Momentum app is a personal productivity and motivation app built for engineering students.

Objectives:

Boost student’s esteem to push forwards during their career.
Work as a scheduler and organizer for tests, projects, and homework.
Tailor motivation to their degrees and classes they’re struggling with.
Show recommended study time and useful resources according to class syllabus.

## Features

- Daily motivational messages tailored to engineering majors
- Educational STEM facts to inspire learning
- Progress tracking for assignments and classes (coming soon)
- Canvas API integration to sync due dates (in progress)
- Personalized dashboard (planned)

---

## How to Run It (Locally)

1. Clone the repository
   ```bash
   git clone https://github.com/MorpheusEpsilon/Momentum.git
   cd Momentum
2. Start the virtual environment
    ```bash
    python3 -m venv venv
    source venv/bin/activate #For MacOS and Linux
3. Install requirements
    ```bash
    pip install -r requirements.txt
4. Run Locally
    ```bash
    uvicorn src.backend.main:app --reload
5. Visit at Homepage: http://127.0.0.1:8000

## Project Structure

```
Momentum/
├── src/
│   ├── backend/          # FastAPI backend
│   │   ├── main.py      # Application entry point
│   │   ├── authentication.py
│   │   ├── security.py
│   │   ├── user_data.py
│   │   ├── motivation.py
│   │   ├── schedule.py
│   │   └── quotes/      # Quote collections
│   └── frontend/         # Frontend (empty for now)
├── tests/               # Test suite
├── requirements.txt
└── README.md
```
   
Contributors:
Mayra Miranda Moreno - Backend, Frontend & UX
Jose Antonio Murphy - Concept, Backend & UI 

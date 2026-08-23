from dataclasses import dataclass
from typing import Optional
from backend.enums import TaskType
from pathlib import Path
import joblib

MODEL_VERSION = "task-classifier-v1"

SUBTYPE_CONFIDENCE_THRESHOLD = 0.6 # a single keyword match is enough to suggest subtype in this version

# Keyword -> TaskType -> subtype guess
# (e.g. "exam" matches TaskType.ACADEMIC and predicted_subtype = "exam").
# a REAL MODEL replaces this dict lookup later, the classify function will be the interface to the model

KEYWORD_MAP: dict[str, TaskType] = {
    # academic
    "exam": TaskType.ACADEMIC,
    "midterm": TaskType.ACADEMIC,
    "homework": TaskType.ACADEMIC,
    "quiz": TaskType.ACADEMIC,
    "assignment": TaskType.ACADEMIC,
    "reading": TaskType.ACADEMIC,
    "lecture": TaskType.ACADEMIC,
    "lab report": TaskType.ACADEMIC,
    "problem set": TaskType.ACADEMIC,
    # health
    "doctor": TaskType.HEALTH,
    "dentist": TaskType.HEALTH,
    "therapy": TaskType.HEALTH,
    "appointment": TaskType.HEALTH,
    "gym": TaskType.HEALTH,
    # social
    "party": TaskType.SOCIAL,
    "club": TaskType.SOCIAL,
    "meetup": TaskType.SOCIAL,
    "hangout": TaskType.SOCIAL,
    # personal
    "errand": TaskType.PERSONAL,
    "renew": TaskType.PERSONAL,
    "email": TaskType.PERSONAL,
    "call": TaskType.PERSONAL,
}

# ==== ML Model Loading (module-level, runs once at import) ====
# __file__ built-in variable holding the path to the file
# .resolve() turns into absolute path
# parent.parent walks up two directories (to repo root)
MODEL_DIR = Path(__file__).resolve().parent.parent / "models"
ml_model = joblib.load(MODEL_DIR / "task_classifier_v1_logreg.joblib")
ml_vectorizer = joblib.load(MODEL_DIR / "task_classifier_v1_vectorizer.joblib")

@dataclass
class ClassifierResult:
    predicted_type: TaskType
    predicted_subtype: Optional[str]
    confidence: float
    model_version: str
    
def classify(title: str, description: Optional[str]) -> ClassifierResult:
    """
    Predicts task subtype using a trained TF-IDF + Logistic Regression model.
    Subtype remains rule-based: uses keyword matching restricted to the ones 
    that match the model's predicted type.
    Returns a ClassifierResult with the predicted type, subtype, confidence score, and model version.
    """
    
    text = f"{title} {description or ''}".lower()
    
    # TYPE + CONFIDENCE (model)
    text_vector = ml_vectorizer.transform([text]) # list[] because it exects iterable of documents
    predicted_label = ml_model.predict(text_vector)[0] # [0] because it returns an array
    probabilities = ml_model.predict_proba(text_vector)[0]
    
    predicted_type = TaskType(predicted_label) # converts str into enum member
    confidence = float(max(probabilities))
    
    # SUBTYPE (rule-based, filtered to predicted type)
    predicted_subtype = None
    
    if confidence >= SUBTYPE_CONFIDENCE_THRESHOLD:
        for keyword, task_type in KEYWORD_MAP.items():
            if task_type == predicted_type and keyword in text:
                predicted_subtype = keyword
                break
    
    return ClassifierResult(
        predicted_type=predicted_type,
        predicted_subtype=predicted_subtype,
        confidence=confidence,
        model_version=MODEL_VERSION,
    )
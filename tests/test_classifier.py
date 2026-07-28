from unittest.mock import patch
from backend.classifier import classify
from backend.enums import TaskType

# Shape / type tests
def test_classify_returns_correct_shape():
    result = classify("Finish calculus problem set", "10 practice problems")
    
    assert isinstance(result.predicted_type, TaskType)
    assert isinstance(result.confidence, float)
    assert 0.0 <= result.confidence <= 1.0
    assert result.predicted_subtype is None or isinstance(result.predicted_subtype, str)
    assert isinstance(result.model_version, str)
 
def test_classify_predicted_type_always_valid_even_with_no_keywords():
    result = classify("check canvas for diff eqs", "check grades")
    
    assert result.predicted_type in list(TaskType)
    
# Subtype filtering (mocked model)
def test_subtype_ignores_keywords_outside_predicted_type():
    with patch("backend.classifier.ml_model") as mock_model:
        mock_model.predict.return_value = ["academic"]
        mock_model.predict_proba.return_value = [[0.7, 0.1, 0.1, 0.1]]
        
        # text contains health keyword but is forced to predict academic
        result = classify("doctor's appointment before my exam", None)
        
    assert result.predicted_type == TaskType.ACADEMIC
    assert result.predicted_subtype == "exam" # "doctor" must be ignored
    
def test_subtype_is_none_below_confidence_threshold():
    with patch("backend.classifier.ml_model") as mock_model:
        mock_model.predict.return_value = ["academic"]
        mock_model.predict_proba.return_value = [[0.3, 0.3, 0.2, 0.2]]  # max = 0.3

        # "exam" keyword IS present, but confidence gate should block it
        result = classify("exam tomorrow", None)

    assert result.predicted_subtype is None

def test_subtype_is_none_when_no_keyword_matches_predicted_type():
    with patch("backend.classifier.ml_model") as mock_model:
        mock_model.predict.return_value = ["personal"]
        mock_model.predict_proba.return_value = [[0.1, 0.1, 0.1, 0.7]]  # max = 0.7

        # Text only contains an ACADEMIC keyword, but model predicted PERSONAL
        result = classify("exam tomorrow", None)

    assert result.predicted_subtype is None
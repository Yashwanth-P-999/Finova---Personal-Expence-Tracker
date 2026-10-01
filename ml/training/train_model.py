"""
SmartFin Machine Learning Training Pipeline
CSE Final Year Project Module: Automatic Expense Categorization
Model: TF-IDF Vectorizer + Multinomial Logistic Regression
"""

import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
import joblib

def train_expense_model():
    dataset_path = os.path.join(os.path.dirname(__file__), '../datasets/expense_dataset.csv')
    print(f"Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)

    X = df['description']
    y = df['category']

    # Stratified Train/Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"Total Samples: {len(df)} | Train: {len(X_train)} | Test: {len(X_test)}")

    # End-to-end NLP Pipeline
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            stop_words='english'
        )),
        ('clf', LogisticRegression(
            C=1.5,
            max_iter=1000,
            class_weight='balanced'
        ))
    ])

    print("Training TF-IDF + Logistic Regression Classifier...")
    pipeline.fit(X_train, y_train)

    # Evaluation
    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nModel Accuracy: {accuracy * 100:.2f}%\n")
    print("Classification Report:\n", classification_report(y_test, y_pred, zero_division=0))

    # Save artifact
    output_dir = os.path.join(os.path.dirname(__file__), '../models')
    os.makedirs(output_dir, exist_ok=True)
    model_path = os.path.join(output_dir, 'expense_classifier.joblib')
    joblib.dump(pipeline, model_path)
    print(f"Trained pipeline model saved to: {model_path}")

if __name__ == '__main__':
    train_expense_model()

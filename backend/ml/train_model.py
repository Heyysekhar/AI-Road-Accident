"""
Accident Prediction Model Training Script
Run: python train_model.py
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

def generate_sample_data(n=5000):
    """Generate synthetic training data"""
    np.random.seed(42)
    data = {
        "hour": np.random.randint(0, 24, n),
        "day_of_week": np.random.randint(0, 7, n),
        "weather": np.random.randint(0, 4, n),
        "road_condition": np.random.randint(0, 3, n),
        "speed": np.random.uniform(20, 120, n),
        "traffic_density": np.random.randint(0, 3, n),
        "driver_age": np.random.randint(18, 70, n),
        "driver_experience": np.random.randint(0, 40, n),
        "visibility": np.random.uniform(10, 100, n),
        "temperature": np.random.uniform(-5, 45, n),
    }
    df = pd.DataFrame(data)

    # Create accident label based on risk factors
    risk = (
        (df["weather"] >= 2).astype(int) * 0.25 +
        (df["road_condition"] >= 1).astype(int) * 0.2 +
        (df["speed"] > 80).astype(int) * 0.2 +
        (df["visibility"] < 40).astype(int) * 0.15 +
        (df["traffic_density"] == 2).astype(int) * 0.1 +
        (df["driver_age"] < 22).astype(int) * 0.1
    )
    noise = np.random.uniform(0, 0.2, n)
    df["accident"] = ((risk + noise) > 0.4).astype(int)
    return df

def train():
    print("🚀 Training Accident Prediction Model...")
    df = generate_sample_data(10000)
    
    features = ["hour","day_of_week","weather","road_condition","speed",
                 "traffic_density","driver_age","driver_experience","visibility","temperature"]
    X = df[features]
    y = df["accident"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Random Forest
    print("Training Random Forest...")
    rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    rf_acc = accuracy_score(y_test, rf.predict(X_test))
    print(f"Random Forest Accuracy: {rf_acc:.4f}")

    # Gradient Boosting (XGBoost-style)
    print("Training Gradient Boosting...")
    gb = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42)
    gb.fit(X_train, y_train)
    gb_acc = accuracy_score(y_test, gb.predict(X_test))
    print(f"Gradient Boosting Accuracy: {gb_acc:.4f}")

    # Choose best model
    best_model = rf if rf_acc >= gb_acc else gb
    best_name = "RandomForest" if rf_acc >= gb_acc else "GradientBoosting"
    print(f"\n✅ Best Model: {best_name} ({max(rf_acc, gb_acc):.4f})")
    print(classification_report(y_test, best_model.predict(X_test)))

    # Save model
    save_path = os.path.join(os.path.dirname(__file__), "accident_model.pkl")
    joblib.dump(best_model, save_path)
    print(f"💾 Model saved: {save_path}")
    
    # Feature importance
    if hasattr(best_model, "feature_importances_"):
        fi = pd.Series(best_model.feature_importances_, index=features).sort_values(ascending=False)
        print("\nFeature Importance:")
        print(fi)

if __name__ == "__main__":
    train()

"""
Accident Prediction - EDA & Model Training
Run: python accident_eda.py
"""
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import joblib, os

np.random.seed(42)
n = 8000

df = pd.DataFrame({
    'hour': np.random.randint(0, 24, n),
    'day_of_week': np.random.randint(0, 7, n),
    'weather': np.random.choice([0,1,2,3], n, p=[0.55,0.25,0.15,0.05]),
    'road_condition': np.random.choice([0,1,2], n, p=[0.6,0.3,0.1]),
    'speed': np.random.normal(65, 20, n).clip(20, 130),
    'traffic_density': np.random.choice([0,1,2], n, p=[0.3,0.45,0.25]),
    'driver_age': np.random.randint(18, 70, n),
    'driver_experience': np.random.randint(0, 40, n),
    'visibility': np.random.uniform(15, 100, n),
    'temperature': np.random.uniform(-5, 45, n),
})

risk = (
    (df['weather'] >= 2).astype(float) * 0.25 +
    (df['road_condition'] >= 1).astype(float) * 0.20 +
    (df['speed'] > 80).astype(float) * 0.20 +
    (df['visibility'] < 40).astype(float) * 0.15 +
    (df['traffic_density'] == 2).astype(float) * 0.10 +
    (df['driver_age'] < 22).astype(float) * 0.10 +
    np.random.uniform(0, 0.15, n)
)
df['accident'] = (risk > 0.4).astype(int)

print("Dataset shape:", df.shape)
print("\nClass distribution:")
print(df['accident'].value_counts())
print(f"\nAccident rate: {df['accident'].mean()*100:.1f}%")

# EDA Plots
fig, axes = plt.subplots(2, 3, figsize=(15, 10))
fig.suptitle('Accident Prediction - EDA', fontsize=16, fontweight='bold')

pd.crosstab(df['weather'], df['accident']).plot(kind='bar', ax=axes[0,0], color=['#22c55e','#ef4444'])
axes[0,0].set_title('Weather vs Accident')
axes[0,0].set_xticklabels(['Clear','Rain','Fog','Snow'], rotation=0)

df.groupby('hour')['accident'].mean().plot(kind='line', ax=axes[0,1], color='#3b82f6', marker='o')
axes[0,1].set_title('Accident Rate by Hour of Day')

axes[0,2].hist(df[df['accident']==0]['speed'], bins=30, alpha=0.7, color='#22c55e', label='No Accident')
axes[0,2].hist(df[df['accident']==1]['speed'], bins=30, alpha=0.7, color='#ef4444', label='Accident')
axes[0,2].set_title('Speed Distribution by Outcome')
axes[0,2].legend()

pd.crosstab(df['traffic_density'], df['accident']).plot(kind='bar', ax=axes[1,0], color=['#22c55e','#ef4444'])
axes[1,0].set_title('Traffic Density vs Accident')
axes[1,0].set_xticklabels(['Low','Med','High'], rotation=0)

df.groupby('driver_age')['accident'].mean().rolling(5).mean().plot(ax=axes[1,1], color='#8b5cf6')
axes[1,1].set_title('Accident Rate by Driver Age')

axes[1,2].scatter(df['visibility'], df['speed'], c=df['accident'],
    cmap='RdYlGn_r', alpha=0.3, s=5)
axes[1,2].set_title('Visibility vs Speed (red=accident)')
axes[1,2].set_xlabel('Visibility %')
axes[1,2].set_ylabel('Speed km/h')

plt.tight_layout()
plt.savefig('../screenshots/eda_plots.png', dpi=150, bbox_inches='tight')
print("EDA plot saved to screenshots/eda_plots.png")

# Train model
features = ['hour','day_of_week','weather','road_condition','speed',
            'traffic_density','driver_age','driver_experience','visibility','temperature']
X = df[features]
y = df['accident']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)
preds = model.predict(X_test)
acc = accuracy_score(y_test, preds)
print(f"\nModel Accuracy: {acc*100:.2f}%")
print(classification_report(y_test, preds))

save_path = os.path.join(os.path.dirname(__file__), '../backend/ml/accident_model.pkl')
joblib.dump(model, save_path)
print(f"Model saved: {save_path}")

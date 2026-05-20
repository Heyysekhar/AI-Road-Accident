# 📊 Datasets for Accident Prediction

## Recommended Datasets

### 1. UK Road Safety Data (Best for training)
- URL: https://www.data.gov.uk/dataset/cb7ae6f0-4be6-4935-9277-47e5ce24a11f/road-safety-data
- Size: 1M+ records
- Features: Weather, road type, speed limit, casualties

### 2. US Accident Dataset (Kaggle)
- URL: https://www.kaggle.com/datasets/sobhanmoosavi/us-accidents
- Size: 2.8M records
- Features: Weather, time, location, severity

### 3. India Road Accident Data
- URL: https://data.gov.in/catalog/road-accidents-india
- Covers: State-wise, cause-wise accident data

### 4. UCI ML Repository
- URL: https://archive.ics.uci.edu/
- Search: "road accident" or "traffic"

## How to Use

1. Download CSV from above sources
2. Place in this dataset/ folder
3. Modify notebooks/accident_eda.py to load your CSV:

```python
df = pd.read_csv('../dataset/your_file.csv')
```

4. Map your columns to: hour, weather, speed, road_condition, etc.
5. Re-run training: python train_model.py

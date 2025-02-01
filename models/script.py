from sklearn.ensemble import RandomForestClassifier
import pandas as pd

# Load and preprocess data
data = pd.read_csv('fertility.csv')
features = data.drop(columns=['Diagnosis'])
labels = data['Diagnosis']

# Train a model
model = RandomForestClassifier()
model.fit(features, labels)

# Save the model
import joblib
joblib.dump(model, 'fertility_model.pkl')

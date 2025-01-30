import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# Load the fertility dataset
data = pd.read_csv('fertility.csv')

# Preprocess data
# Convert categorical values to numeric (e.g., one-hot encoding)
data['Childish diseases'] = data['Childish diseases'].map({'yes': 1, 'no': 0})
data['Accident or serious trauma'] = data['Accident or serious trauma'].map({'yes': 1, 'no': 0})
data['Surgical intervention'] = data['Surgical intervention'].map({'yes': 1, 'no': 0})
data['High fevers in the last year'] = data['High fevers in the last year'].map({'less than 3 months ago': 1, 'more than 3 months ago': 0})
data['Frequency of alcohol consumption'] = data['Frequency of alcohol consumption'].map({
    'hardly ever or never': 0,
    'once a week': 1,
    'several times a week': 2,
    'every day': 3
})
data['Smoking habit'] = data['Smoking habit'].map({'never': 0, 'occasional': 1, 'daily': 2})
data['Diagnosis'] = data['Diagnosis'].map({'Normal': 0, 'Altered': 1})

# Define features (X) and target (y)
X = data.drop(['Diagnosis'], axis=1)
y = data['Diagnosis']

# Split into train and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train a random forest classifier
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

# Evaluate the model
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {accuracy * 100:.2f}%")

# Save the model
joblib.dump(model, 'fertility_model.pkl')
print("Model saved as 'fertility_model.pkl'")

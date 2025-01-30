import sys
import json
import joblib

# Load the trained model
model = joblib.load('fertility_model.pkl')

def predict(user_data):
    # Convert user data into model input format
    features = [
        user_data['age'],
        user_data['childish_diseases'],
        user_data['trauma'],
        user_data['surgical_intervention'],
        user_data['high_fevers'],
        user_data['alcohol_frequency'],
        user_data['smoking_habit'],
        user_data['hours_sitting']
    ]

    # Make a prediction
    prediction = model.predict([features])[0]
    return {"Diagnosis": "Normal" if prediction == 0 else "Altered"}

if __name__ == "__main__":
    # Read user data from Node.js
    user_data = json.loads(sys.argv[1])
    result = predict(user_data)
    print(json.dumps(result))  # Send JSON response back to Node.js

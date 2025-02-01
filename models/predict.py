from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

# Load the model
model = joblib.load('fertility_model.pkl')

@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    data = request.json
    features = pd.DataFrame([data])
    prediction = model.predict(features)
    return jsonify({'Diagnosis': prediction[0]})

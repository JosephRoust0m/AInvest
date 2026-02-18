import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from flask import Flask, request, jsonify
import os

app = Flask(__name__)

def train_model(prices):
    # Convert price list into a DataFrame
    df = pd.DataFrame({'prices': prices})
    # Create lagged features (previous day's price)
    df['prices_prev'] = df['prices'].shift(1)
    df.dropna(inplace=True)  # Remove empty rows

    # Prepare data for training
    X = df[['prices_prev']]
    y = df['prices']  # Target: next day's price

    model = RandomForestRegressor(n_estimators=100)
    model.fit(X, y)

    return model

@app.route('/analyze', methods=['POST'])
def analyze():
    if not request.is_json:
        return jsonify({"error": "Invalid input, JSON expected"}), 400
    data = request.json
    print(data)
    prices = data.get("information")
    if not prices:
        return jsonify({"error": "Data is empty"}), 400
    averageofPrices= average_prediction = float(np.mean(prices))
    print(averageofPrices)
    model = train_model(prices)

    # Predict next `N` days based on the last known price
    predictions = []
    last_price = prices[-1]

    for i in range(len(prices)):
        pred = model.predict([[last_price]])[0]
        predictions.append(pred)
        last_price = pred  # Update with predicted price

    #get the average of the predictions   
    average_prediction = float(np.mean(predictions))
    
    rate_of_change=((average_prediction-averageofPrices)/averageofPrices)*100
    
    print(average_prediction)
    print (rate_of_change)
    return jsonify(
        {"rate_of_change": rate_of_change,
         "score_prediction": average_prediction})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "Stock-Predictor"})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

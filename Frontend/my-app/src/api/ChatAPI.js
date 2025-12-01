class ChatAPI {
  constructor() {
    this.aiBackendURL = 'https://ai-microservice-dthnb4cne0cpbscf.canadacentral-01.azurewebsites.net';
  }

  async sendMessage(message, context = []) {
    try {
      const response = await fetch(this.aiBackendURL+`/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          message: message,
          context: context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        response: data.response || "I'm sorry, I couldn't process your request at the moment. Please try again."
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: "I can only answer finance related questions :)"
      };
    }
  }

  async predictStock(stockName, timeframe) {
    try {
      const response = await fetch(this.aiBackendURL+`/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          stock: stockName,
          timeframe: timeframe
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      return {
        success: true,
        prediction: data
      };
    } catch (error) {
      console.error('Error predicting stock:', error);
      return {
        success: false,
        error: "Unable to get stock prediction at the moment. Please try again."
      };
    }
  }
}

export default new ChatAPI();
class MessageAPI {
  constructor() {
    this.baseURL = 'http://localhost:8080';
  }

  async sendMessage(message) {
    try {
      const response = await fetch(this.baseURL + '/api/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(message),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }
}


export default new MessageAPI();

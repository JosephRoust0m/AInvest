const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:4000';

class ApiGatewayService {
  async _request(path, method, body, token) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };
    if (body !== null && method !== 'GET') {
      options.body = JSON.stringify(body);
    }
    const response = await fetch(API_GATEWAY_URL + path, options);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }
    return response.json();
  }

  async sendChatMessage(message, context, token) {
    return this._request('/api/chat', 'POST', { message, context }, token);
  }

  async predictStock(stockName, timeframe, token) {
    return this._request('/api/predict', 'POST', { stock: stockName, timeframe }, token);
  }

  async fetchAdvisors(token) {
    return this._request('/api/advisor', 'GET', null, token);
  }

  async fetchAdvisorConversations(username, token) {
    return this._request(`/api/advisor/conversations?username=${encodeURIComponent(username)}`, 'GET', null, token);
  }

  async fetchUserConversations(username, token) {
    return this._request(`/api/user/conversations?username=${encodeURIComponent(username)}`, 'GET', null, token);
  }

  async saveConversations(conversations, token) {
    return this._request('/api/conversations/save', 'POST', { conversations }, token);
  }

  async sendMessage(message, token) {
    return this._request('/api/message', 'POST', message, token);
  }

  async sendLogoutTimestamp(username, token) {
    return this._request('/api/user/logout-timestamp', 'POST', {
      username,
      logoutTimestamp: new Date().toISOString(),
    }, token);
  }

  async sendLogoutTimestampAdvisor(username, token) {
    return this._request('/api/advisor/logout-timestamp', 'POST', {
      username,
      logoutTimestamp: new Date().toISOString(),
    }, token);
  }
}

export default new ApiGatewayService();

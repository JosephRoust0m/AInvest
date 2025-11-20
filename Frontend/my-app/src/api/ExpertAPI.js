class ExpertAPI {
  constructor() {
    this.baseURL = 'http://localhost:7000';
  }

  async getAllExperts() {
    try {
      const response = await fetch(`${this.baseURL}/api/experts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        experts: data
      };
    } catch (error) {
      console.error('Error fetching experts:', error);
      return {
        success: false,
        error: 'Failed to load experts'
      };
    }
  }

  async sendMessageToExpert(expertUsername, message, username) {
    try {
      const response = await fetch(`${this.baseURL}/api/experts/${expertUsername}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          message: message,
          username: username
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        response: data.response || 'Message sent to expert'
      };
    } catch (error) {
      console.error('Error sending message to expert:', error);
      return {
        success: false,
        error: 'Failed to send message to expert'
      };
    }
  }

  async getAllUserConversations(username) {
    try {
      console.log("getting all convos");
      const response = await fetch(`${this.baseURL}/api/conversations/user/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        conversations: data.conversations || []
      };
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      return {
        success: false,
        error: 'Failed to fetch conversations'
      };
    }
  }

  async saveConversation(username, expertUsername, messages) {
    try {
      const response = await fetch(`${this.baseURL}/api/conversations/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          username,
          expertUsername,
          messages,
          lastUpdated: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        conversationId: data.conversationId
      };
    } catch (error) {
      console.error('Error saving conversation:', error);
      return {
        success: false,
        error: 'Failed to save conversation'
      };
    }
  }

  async getAllExpertConversations(expertUsername) {
    try {
      console.log("getting all expert convos");
      const response = await fetch(`${this.baseURL}/api/conversations/expert/${expertUsername}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        conversations: data.conversations || []
      };
    } catch (error) {
      console.error('Error fetching expert conversations:', error);
      return {
        success: false,
        error: 'Failed to fetch expert conversations'
      };
    }
  }

}

export default new ExpertAPI();
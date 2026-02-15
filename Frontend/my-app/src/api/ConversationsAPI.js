class ConversationsAPI {
  constructor() {
    this.baseURL = 'http://localhost:7000';
  }

  async saveConversations(conversations) {
    try {
      const response = await fetch(this.baseURL + '/api/conversations/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(conversations),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save conversations');
      }
      return await response.json();
    } catch (error) {
      console.error('Save conversations error:', error);
      throw error;
    }
  }
}

export default new ConversationsAPI();

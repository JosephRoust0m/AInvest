class AdvisorsAPI {
  constructor() {
    this.baseURL = 'https://ainvest-8zvd.onrender.com';
  }

  async fetchAdvisors() {
    try {
      const response = await fetch(this.baseURL+`/api/advisor`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Fetch advisors error:', error);
      throw error;
    }
  }

    async fetchAllConversations(username) {
        try {
        const response = await fetch(this.baseURL+`/api/advisor/conversations?username=${username}`, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        const result = await response.json();
        
        return result;
        } catch (error) {
        console.error('Fetch conversations error:', error);
        throw error;
        }
  }

}

export default new AdvisorsAPI();
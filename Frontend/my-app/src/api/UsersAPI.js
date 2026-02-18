class UsersAPI {
  constructor() {
    this.baseURL = 'https://ainvest-8zvd.onrender.com';
  }

  async fetchUsers(advisorUsername) {
    try {
      const response = await fetch(this.baseURL+`/api/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ advisor: advisorUsername })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const result = await response.json();
      
      return result;
    } catch (error) {
      console.error('Fetch users error:', error);
      throw error;
    }
  }
    async fetchAllConversations(username) {
        try {
        const response = await fetch(this.baseURL+`/api/user/conversations?username=${username}`, {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        const result = await response.json();
        
        return result;
        } catch (error) {
        console.error('Sign in error:', error);
        throw error;
        }
  }
}

export default new UsersAPI();
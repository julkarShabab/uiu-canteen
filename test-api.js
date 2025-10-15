// Test script to verify API connectivity
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
  try {
    console.log('Testing API connectivity...');
    
    // Test the test endpoint
    const testResponse = await axios.post(`${API_URL}/test`, { test: 'data' });
    console.log('Test endpoint response:', testResponse.data);
    
    // Test registration
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      type: 'customer'
    };
    
    console.log('Testing registration with:', userData);
    const registerResponse = await axios.post(`${API_URL}/auth/register`, userData);
    console.log('Registration response:', registerResponse.data);
    
    return 'All tests completed';
  } catch (error) {
    console.error('API Test Error:', error.response ? error.response.data : error.message);
    return 'Tests failed';
  }
}

testAPI().then(console.log);
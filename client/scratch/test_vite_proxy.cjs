const axios = require('axios');

async function testViteProxy() {
  try {
    const res = await axios.get('http://localhost:5173/uploads/1780875525774-2740581.jpeg');
    console.log('Vite Proxy Status:', res.status);
    console.log('Vite Proxy Content Length:', res.headers['content-length']);
  } catch (err) {
    console.error('Vite Proxy Error:', err.message);
    if (err.response) {
      console.error('Response Status:', err.response.status);
    }
  }
}

testViteProxy();

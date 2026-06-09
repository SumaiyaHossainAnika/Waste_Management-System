const axios = require('axios');

async function testFetch() {
  try {
    const res = await axios.get('http://localhost:5000/uploads/1780875525774-2740581.jpeg');
    console.log('Fetch Status:', res.status);
    console.log('Headers:', res.headers);
  } catch (err) {
    console.error('Error details:', err.message);
    if (err.response) {
      console.error('Response Status:', err.response.status);
      console.error('Response Headers:', err.response.headers);
    }
  }
}

testFetch();

// server/scratch/test_helal_locations.js
const axios = require('axios');

(async () => {
  try {
    console.log('1. Logging in as helal@gmail.com...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'helal@gmail.com',
      password: '1234'
    });

    const { token, user } = loginRes.data;
    console.log('✓ Login successful!');
    console.log('  Assigned Location ID:', user.assigned_location_id);
    console.log('  Wards:', user.assignedLocation.wards);
    console.log('  Employees:', user.assignedLocation.total_employees);
    console.log('  Daily Waste (tons):', user.assignedLocation.daily_load_tons);

    const headers = { Authorization: `Bearer ${token}` };

    console.log('\n2. Fetching locations for Helal...');
    const locationsRes = await axios.get('http://localhost:5000/api/locations', { headers });
    const { locations } = locationsRes.data;

    console.log('✓ Locations fetched successfully!');
    console.log('  Total locations returned:', locations.length);

    // Filter by wards
    const ward2 = locations.filter(l => l.wards.includes('2'));
    const ward3 = locations.filter(l => l.wards.includes('3'));
    const ward5 = locations.filter(l => l.wards.includes('5'));
    const ward6 = locations.filter(l => l.wards.includes('6'));
    const ward7 = locations.filter(l => l.wards.includes('7'));

    console.log('  Ward 2 locations:', ward2.length);
    console.log('  Ward 3 locations:', ward3.length);
    console.log('  Ward 5 locations:', ward5.length);
    console.log('  Ward 6 locations:', ward6.length);
    console.log('  Ward 7 locations:', ward7.length);

    if (locations.length < 56) {
      throw new Error(`Expected at least 56 locations (Pallabi + 55 new ones), but got ${locations.length}`);
    }

    console.log('\nVERIFICATION PASSED! Helal correctly sees all assigned ward locations.');
  } catch (err) {
    console.error('❌ Verification failed:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
})();

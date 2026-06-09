const axios = require('axios');

(async () => {
  try {
    console.log('1. Testing Login Endpoint with helal@gmail.com...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'helal@gmail.com',
      password: '1234'
    });

    const { token, user } = loginRes.data;
    console.log('✓ Login successful!');
    console.log('  User Name:', user.full_name);
    console.log('  Role:', user.role);
    console.log('  Assigned Location ID:', user.assigned_location_id);

    if (user.assigned_location_id !== 1) {
      throw new Error(`Expected location ID 1, got ${user.assigned_location_id}`);
    }

    // Set auth header
    const headers = { Authorization: `Bearer ${token}` };

    console.log('\n2. Testing /locations/stats Endpoint...');
    const statsRes = await axios.get('http://localhost:5000/api/locations/stats', { headers });
    const { stats } = statsRes.data;
    console.log('✓ Stats fetched successfully!');
    console.log('  Vehicles count:', stats.vehicles);
    console.log('  Bins count:', stats.bins);
    console.log('  Employees count:', stats.employees);
    console.log('  Daily Waste (tons):', stats.totalDailyWasteTons);

    if (stats.vehicles !== 72) {
      throw new Error(`Expected 72 vehicles, got ${stats.vehicles}`);
    }
    if (stats.bins !== 5) {
      throw new Error(`Expected 5 bins, got ${stats.bins}`);
    }
    if (stats.employees !== 110) {
      throw new Error(`Expected 110 employees, got ${stats.employees}`);
    }
    if (parseFloat(stats.totalDailyWasteTons) !== 100) {
      throw new Error(`Expected 100.00 daily waste tons, got ${stats.totalDailyWasteTons}`);
    }

    console.log('\n3. Testing /vehicles Endpoint for Location 1...');
    const vehiclesRes = await axios.get('http://localhost:5000/api/vehicles?location_id=1', { headers });
    const { vehicles } = vehiclesRes.data;
    const vans = vehicles.filter(v => v.vehicle_type === 'rickshaw_van');
    const trucks = vehicles.filter(v => v.vehicle_type === 'truck' || v.vehicle_type === 'mini_truck');

    console.log('✓ Vehicles fetched successfully!');
    console.log('  Total vehicles:', vehicles.length);
    console.log('  Vans count:', vans.length);
    console.log('  Trucks/Mini-Trucks count:', trucks.length);

    if (vans.length !== 65) {
      throw new Error(`Expected 65 vans, got ${vans.length}`);
    }
    if (trucks.length !== 7) {
      throw new Error(`Expected 7 trucks/mini-trucks, got ${trucks.length}`);
    }

    console.log('\nALL TESTS PASSED SUCCESSFULLY! The backend serves the correct Pallabi data.');
  } catch (err) {
    console.error('❌ Test failed:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
})();

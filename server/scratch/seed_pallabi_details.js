const pool = require('../src/config/db');
const bcrypt = require('bcryptjs');

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('1. Updating Location 1 (Pallabi, Mirpur 12)...');
    await client.query(`
      UPDATE locations 
      SET name = $1, 
          latitude = $2, 
          longitude = $3, 
          covered_area = $4, 
          wards = $5, 
          total_employees = $6, 
          daily_load_tons = $7, 
          peak_day = $8, 
          sorting_system = $9, 
          problems = $10, 
          improvements = $11,
          status = 'active',
          updated_at = NOW()
      WHERE id = 1
    `, [
      'Pallabi, Mirpur 12',
      23.828969,
      90.365585,
      'Wards 2, 3, 5, 6 and 7',
      ['2', '3', '5', '6', '7'],
      110,
      100.00,
      'Saturday',
      'No formal sorting system - household, commercial, institutional and medical wastes are all deposited in the same bins. Sorting plastic paper (plastic paper sell).',
      [
        'waste dumped illegally (illegal dumping sites identified)',
        'insufficient coverage',
        'no environmental friendly operation system',
        'risk of diseases',
        'water pollution',
        'drain blockage'
      ],
      [
        'Increase containers and vans',
        'achieves collection efficiency'
      ]
    ]);
    console.log('✓ Updated Location 1');

    console.log('2. Inserting/Updating Manager Account (helal@gmail.com)...');
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash('1234', salt);

    // Delete existing manager user if exists to avoid duplication or conflict, or update
    const userExist = await client.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', ['helal@gmail.com']);
    if (userExist.rows.length > 0) {
      await client.query(
        'UPDATE users SET password_hash = $1, full_name = $2, role = $3, assigned_location_id = $4 WHERE id = $5',
        [hash, 'Helal', 'manager', 1, userExist.rows[0].id]
      );
      console.log('✓ Updated existing Manager: helal@gmail.com / 1234');
    } else {
      await client.query(
        'INSERT INTO users (email, password_hash, full_name, role, assigned_location_id) VALUES ($1, $2, $3, $4, $5)',
        ['helal@gmail.com', hash, 'Helal', 'manager', 1]
      );
      console.log('✓ Created Manager: helal@gmail.com / 1234');
    }

    console.log('3. Cleaning existing vehicles for Location 1...');
    await client.query('UPDATE collection_records SET vehicle_id = NULL');
    await client.query('DELETE FROM vehicles WHERE location_id = 1');

    console.log('4. Seeding new vehicles for Location 1 (65 Vans, 7 Trucks)...');
    // Rickshaw Vans (65 vans)
    for (let i = 1; i <= 65; i++) {
      const plate = `VAN-1-RV${i.toString().padStart(2, '0')}`;
      await client.query(`
        INSERT INTO vehicles (location_id, vehicle_type, plate_number, capacity_tons, trips_per_day, status)
        VALUES (1, 'rickshaw_van', $1, 0.50, 2, 'active')
      `, [plate]);
    }
    // Big Trucks (7 trucks)
    // We can distribute different capacities: say, 4 large trucks (5.00 tons) and 3 mini trucks (2.50 tons)
    for (let i = 1; i <= 4; i++) {
      const plate = `VAN-1-TR${i}`;
      await client.query(`
        INSERT INTO vehicles (location_id, vehicle_type, plate_number, capacity_tons, trips_per_day, status)
        VALUES (1, 'truck', $1, 5.00, 10, 'active')
      `, [plate]);
    }
    for (let i = 1; i <= 3; i++) {
      const plate = `VAN-1-MT${i}`;
      await client.query(`
        INSERT INTO vehicles (location_id, vehicle_type, plate_number, capacity_tons, trips_per_day, status)
        VALUES (1, 'mini_truck', $1, 2.50, 10, 'active')
      `, [plate]);
    }
    console.log('✓ Seeded 65 rickshaw vans and 7 trucks');

    console.log('5. Cleaning existing waste bins for Location 1...');
    await client.query('DELETE FROM waste_bins WHERE location_id = 1');

    console.log('6. Seeding waste bins matching the 10 data points...');
    const bins = [
      { bin_code: 'BIN-PL-MRKT', lat: 23.827300, lng: 90.365200, capacity: 1500, type: 'dumpster' }, // Pt 2
      { bin_code: 'BIN-PL-SEC12', lat: 23.826155, lng: 90.367308, capacity: 1000, type: 'standard' }, // Pt 4
      { bin_code: 'BIN-PL-BLKE', lat: 23.823289, lng: 90.375977, capacity: 1000, type: 'standard' }, // Pt 8
      { bin_code: 'BIN-PL-KITM', lat: 23.827800, lng: 90.368400, capacity: 1500, type: 'dumpster' }, // Pt 9
      { bin_code: 'BIN-PL-STS', lat: 23.828969, lng: 90.365585, capacity: 3000, type: 'dumpster' }  // Pt 10
    ];
    for (const b of bins) {
      await client.query(`
        INSERT INTO waste_bins (location_id, bin_code, latitude, longitude, capacity_liters, bin_type, status)
        VALUES (1, $1, $2, $3, $4, $5, 'active')
      `, [b.bin_code, b.lat, b.lng, b.capacity, b.type]);
    }
    console.log('✓ Seeded waste bins');

    console.log('7. Cleaning existing dumping hotspots for Location 1...');
    await client.query('DELETE FROM dumping_hotspots WHERE location_id = 1');

    console.log('8. Seeding dumping hotspots...');
    // Seed illegal dumping near local kitchen market and busy roadside
    const hotspots = [
      { lat: 23.827800, lng: 90.368400, severity: 'high', description: 'Illegal organic waste dumping near Section-12 Local Kitchen Market' }, // Pt 9
      { lat: 23.827300, lng: 90.365200, severity: 'medium', description: 'Waste accumulation in Pallabi Mirpur-12 Market Area' } // Pt 2
    ];
    for (const hs of hotspots) {
      await client.query(`
        INSERT INTO dumping_hotspots (location_id, latitude, longitude, severity, description, reported_count, status)
        VALUES (1, $1, $2, $3, $4, 10, 'active')
      `, [hs.lat, hs.lng, hs.severity, hs.description]);
    }
    console.log('✓ Seeded dumping hotspots');

    console.log('9. Cleaning existing heatmap data for Location 1...');
    await client.query('DELETE FROM heatmap_data WHERE location_id = 1');

    console.log('10. Seeding heatmap data...');
    const heatmaps = [
      // waste_concentration
      { type: 'waste_concentration', lat: 23.827800, lng: 90.368400, intensity: 0.90 }, // Pt 9
      { type: 'waste_concentration', lat: 23.827300, lng: 90.365200, intensity: 0.95 }, // Pt 2
      { type: 'waste_concentration', lat: 23.828969, lng: 90.365585, intensity: 0.85 }, // Pt 10
      
      // complaint_density
      { type: 'complaint_density', lat: 23.828000, lng: 90.364000, intensity: 0.80 }, // Pt 1
      { type: 'complaint_density', lat: 23.824200, lng: 90.363700, intensity: 0.85 }, // Pt 7
      { type: 'complaint_density', lat: 23.826155, lng: 90.367308, intensity: 0.75 }, // Pt 4

      // collection_frequency
      { type: 'collection_frequency', lat: 23.828969, lng: 90.365585, intensity: 0.98 }, // Pt 10
      { type: 'collection_frequency', lat: 23.829200, lng: 90.361800, intensity: 0.90 }, // Pt 5
      { type: 'collection_frequency', lat: 23.826400, lng: 90.366100, intensity: 0.85 }, // Pt 3
      { type: 'collection_frequency', lat: 23.824900, lng: 90.370900, intensity: 0.80 }  // Pt 6
    ];
    for (const hm of heatmaps) {
      await client.query(`
        INSERT INTO heatmap_data (location_id, data_type, latitude, longitude, intensity)
        VALUES (1, $1, $2, $3, $4)
      `, [hm.type, hm.lat, hm.lng, hm.intensity]);
    }
    console.log('✓ Seeded heatmap data');

    console.log('11. Cleaning existing road segments for Location 1...');
    await client.query('DELETE FROM road_segments WHERE location_id = 1');

    console.log('12. Seeding road segments for Location 1...');
    const roads = [
      {
        name: 'Mirpur-12 Bus Stand Road',
        start_lat: 23.828000, start_lng: 90.364000,
        end_lat: 23.828969, end_lng: 90.365585,
        width_meters: 8.50,
        road_type: 'primary',
        recommended_vehicle: 'truck',
        notes: 'High pedestrian and vehicle movement connecting bus stand to STS'
      },
      {
        name: 'Pallabi Market Access Road',
        start_lat: 23.827300, start_lng: 90.365200,
        end_lat: 23.828969, end_lng: 90.365585,
        width_meters: 6.50,
        road_type: 'secondary',
        recommended_vehicle: 'mini_truck',
        notes: 'Crowded local shopping road'
      },
      {
        name: 'Mirpur-12 Main Road Shops Segment',
        start_lat: 23.826400, start_lng: 90.366100,
        end_lat: 23.827300, end_lng: 90.365200,
        width_meters: 8.00,
        road_type: 'primary',
        recommended_vehicle: 'truck',
        notes: 'Dense shopfronts and mixed-use commercial road'
      },
      {
        name: 'Section-12 Block C Road 9',
        start_lat: 23.826155, start_lng: 90.367308,
        end_lat: 23.827800, end_lng: 90.368400,
        width_meters: 4.50,
        road_type: 'residential',
        recommended_vehicle: 'rickshaw_van',
        notes: 'Busy neighborhood road with shops and households'
      },
      {
        name: 'Duaripara Road Link',
        start_lat: 23.829200, start_lng: 90.361800,
        end_lat: 23.828000, end_lng: 90.364000,
        width_meters: 6.00,
        road_type: 'secondary',
        recommended_vehicle: 'mini_truck',
        notes: 'Traffic and neighborhood access point'
      },
      {
        name: 'Kalshi Road Approach',
        start_lat: 23.824900, start_lng: 90.370900,
        end_lat: 23.826155, end_lng: 90.367308,
        width_meters: 9.00,
        road_type: 'primary',
        recommended_vehicle: 'truck',
        notes: 'Busy movement corridor near Pallabi side'
      },
      {
        name: 'Mirpur-11.5 to Mirpur-12 Market Strip',
        start_lat: 23.824200, start_lng: 90.363700,
        end_lat: 23.826400, end_lng: 90.366100,
        width_meters: 5.50,
        road_type: 'secondary',
        recommended_vehicle: 'rickshaw_van',
        notes: 'Retail and pedestrian activity corridor'
      },
      {
        name: 'Block E Shops Lane',
        start_lat: 23.823289, start_lng: 90.375977,
        end_lat: 23.824900, end_lng: 90.370900,
        width_meters: 3.50,
        road_type: 'residential',
        recommended_vehicle: 'rickshaw_van',
        notes: 'Shop and local service cluster lane'
      },
      {
        name: 'Local Kitchen Market Lane',
        start_lat: 23.827800, start_lng: 90.368400,
        end_lat: 23.828969, end_lng: 90.365585,
        width_meters: 5.00,
        road_type: 'residential',
        recommended_vehicle: 'mini_truck',
        notes: 'Bazar food market organic waste concentration area access'
      }
    ];
    for (const r of roads) {
      await client.query(`
        INSERT INTO road_segments (name, location_id, start_lat, start_lng, end_lat, end_lng, width_meters, road_type, recommended_vehicle, notes)
        VALUES ($1, 1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [r.name, r.start_lat, r.start_lng, r.end_lat, r.end_lng, r.width_meters, r.road_type, r.recommended_vehicle, r.notes]);
    }
    console.log('✓ Seeded road segments');

    await client.query('COMMIT');
    console.log('SUCCESS: Pallabi, Mirpur 12 details seeded successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('ERROR seeding Pallabi details:', err);
  } finally {
    client.release();
    await pool.end();
  }
})();

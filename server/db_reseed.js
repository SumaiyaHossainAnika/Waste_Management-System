process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 0. Ensure collection_records columns exist
    console.log('Ensuring collection_records columns exist...');
    await client.query(`
      ALTER TABLE collection_records 
      ADD COLUMN IF NOT EXISTS plastic_tons double precision DEFAULT 0.0,
      ADD COLUMN IF NOT EXISTS food_waste_tons double precision DEFAULT 0.0,
      ADD COLUMN IF NOT EXISTS paper_tons double precision DEFAULT 0.0,
      ADD COLUMN IF NOT EXISTS glass_tons double precision DEFAULT 0.0,
      ADD COLUMN IF NOT EXISTS metal_tons double precision DEFAULT 0.0,
      ADD COLUMN IF NOT EXISTS medical_waste_tons double precision DEFAULT 0.0,
      ADD COLUMN IF NOT EXISTS construction_waste_tons double precision DEFAULT 0.0
    `);

    console.log('Converting collection_records columns to double precision...');
    await client.query(`
      ALTER TABLE collection_records 
      ALTER COLUMN waste_tons TYPE double precision,
      ALTER COLUMN plastic_tons TYPE double precision,
      ALTER COLUMN food_waste_tons TYPE double precision,
      ALTER COLUMN paper_tons TYPE double precision,
      ALTER COLUMN glass_tons TYPE double precision,
      ALTER COLUMN metal_tons TYPE double precision,
      ALTER COLUMN medical_waste_tons TYPE double precision,
      ALTER COLUMN construction_waste_tons TYPE double precision
    `);

    // 1. Temporarily clear users' assigned location to avoid foreign key errors
    console.log('Unlinking users from locations...');
    await client.query('UPDATE users SET assigned_location_id = NULL');

    // 2. Clean tables
    console.log('Truncating tables...');
    await client.query('TRUNCATE road_segments, collection_records, employees, vehicles, waste_bins, complaints, dumping_hotspots, heatmap_data, locations RESTART IDENTITY CASCADE');

    // 3. Insert Locations
    console.log('Inserting locations (Wards 16 and Pallabi)...');
    // Location 1: Pallabi, Mirpur 12
    await client.query(`
      INSERT INTO locations (id, name, latitude, longitude, covered_area, wards, total_employees, daily_load_tons, peak_day, sorting_system, problems, improvements, status)
      VALUES (
        1, 'Pallabi, Mirpur 12', 23.828969, 90.365585, 'Wards 2, 3, 5, 6 and 7',
        ARRAY['2', '3', '5', '6', '7'], 110, 100.00, 'Saturday',
        'No formal sorting system - household, commercial, institutional and medical wastes all deposited in same bins.',
        ARRAY['Waste dumped illegally', 'Insufficient coverage'],
        ARRAY['Increase containers and vans'],
        'active'
      )
    `);

    // Ward 16 locations
    const ward16Locations = [
      {
        id: 2,
        name: 'Dakshin Kafrul',
        latitude: 23.788807,
        longitude: 90.388232,
        covered_area: '16 no ward full (kafrul, ibrahimpur)',
        wards: ['16'],
        total_employees: 80,
        daily_load_tons: 15.5,
        peak_day: 'Saturday',
        sorting_system: 'Sorting plastic paper (plastic paper sell)',
        problems: ['Water leakage from truck'],
        improvements: ['Van improve (motored van, mini truck)']
      },
      {
        id: 3,
        name: 'Uttar Kafrul',
        latitude: 23.791500,
        longitude: 90.388000,
        covered_area: 'Uttar Kafrul, Ward 16',
        wards: ['16'],
        total_employees: 18,
        daily_load_tons: 14.0,
        peak_day: 'Saturday',
        sorting_system: 'Plastic paper sold separately.'
      },
      {
        id: 4,
        name: 'Purba Kafrul',
        latitude: 23.789000,
        longitude: 90.392000,
        covered_area: 'Purba Kafrul, Ward 16',
        wards: ['16'],
        total_employees: 22,
        daily_load_tons: 18.5,
        peak_day: 'Saturday',
        sorting_system: 'Plastic paper sold separately.'
      },
      {
        id: 5,
        name: 'Paschim Kafrul',
        latitude: 23.786500,
        longitude: 90.377500,
        covered_area: 'Paschim Kafrul, Ward 16',
        wards: ['16'],
        total_employees: 15,
        daily_load_tons: 12.0,
        peak_day: 'Saturday',
        sorting_system: 'Plastic paper and metal scrap sold separately.'
      },
      {
        id: 6,
        name: 'Uttar Ibrahimpur',
        latitude: 23.797500,
        longitude: 90.384000,
        covered_area: 'Uttar Ibrahimpur, Ward 16',
        wards: ['16'],
        total_employees: 25,
        daily_load_tons: 22.0,
        peak_day: 'Saturday',
        sorting_system: 'Organic composting initiative planned.'
      },
      {
        id: 7,
        name: 'Dakshin Ibrahimpur',
        latitude: 23.793000,
        longitude: 90.383000,
        covered_area: 'Dakshin Ibrahimpur, Ward 16',
        wards: ['16'],
        total_employees: 24,
        daily_load_tons: 20.0,
        peak_day: 'Saturday',
        sorting_system: 'Plastic sorting at household levels.'
      }
    ];

    for (const loc of ward16Locations) {
      await client.query(`
        INSERT INTO locations (id, name, latitude, longitude, covered_area, wards, total_employees, daily_load_tons, peak_day, sorting_system, problems, improvements, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active')
      `, [
        loc.id, loc.name, loc.latitude, loc.longitude, loc.covered_area, loc.wards,
        loc.total_employees, loc.daily_load_tons, loc.peak_day, loc.sorting_system,
        loc.problems || [], loc.improvements || []
      ]);
    }

    // 4. Update managers to be assigned to location 2 (Dakshin Kafrul)
    console.log('Linking managers back to Dakshin Kafrul...');
    await client.query("UPDATE users SET assigned_location_id = 2 WHERE role = 'manager'");

    // 5. Insert Bins
    console.log('Inserting waste bins...');
    const bins = [
      // Pallabi (ID 1)
      { location_id: 1, bin_code: 'BIN-PL-01', latitude: 23.831200, longitude: 90.362100, capacity: 1000, type: 'standard' },
      { location_id: 1, bin_code: 'BIN-PL-02', latitude: 23.825800, longitude: 90.369200, capacity: 1200, type: 'standard' },
      { location_id: 1, bin_code: 'BIN-PL-03', latitude: 23.834100, longitude: 90.366300, capacity: 1500, type: 'dumpster' },
      // Dakshin Kafrul (ID 2)
      { location_id: 2, bin_code: 'BIN-DK-01', latitude: 23.787500, longitude: 90.386500, capacity: 800, type: 'standard' },
      { location_id: 2, bin_code: 'BIN-DK-02', latitude: 23.786500, longitude: 90.385500, capacity: 1000, type: 'standard' },
      // Uttar Kafrul (ID 3)
      { location_id: 3, bin_code: 'BIN-UK-01', latitude: 23.791800, longitude: 90.388500, capacity: 800, type: 'standard' },
      // Purba Kafrul (ID 4)
      { location_id: 4, bin_code: 'BIN-PK-01', latitude: 23.789500, longitude: 90.392500, capacity: 1000, type: 'standard' },
      { location_id: 4, bin_code: 'BIN-PK-02', latitude: 23.788500, longitude: 90.391500, capacity: 800, type: 'standard' },
      // Paschim Kafrul (ID 5)
      { location_id: 5, bin_code: 'BIN-WK-01', latitude: 23.786800, longitude: 90.378000, capacity: 800, type: 'standard' },
      // Uttar Ibrahimpur (ID 6)
      { location_id: 6, bin_code: 'BIN-UI-01', latitude: 23.798000, longitude: 90.384500, capacity: 1200, type: 'dumpster' },
      { location_id: 6, bin_code: 'BIN-UI-02', latitude: 23.797000, longitude: 90.383500, capacity: 1000, type: 'standard' },
      // Dakshin Ibrahimpur (ID 7)
      { location_id: 7, bin_code: 'BIN-DI-01', latitude: 23.793500, longitude: 90.383500, capacity: 1000, type: 'standard' },
      { location_id: 7, bin_code: 'BIN-DI-02', latitude: 23.792500, longitude: 90.382500, capacity: 800, type: 'standard' }
    ];

    for (const bin of bins) {
      await client.query(`
        INSERT INTO waste_bins (location_id, bin_code, latitude, longitude, capacity_liters, bin_type, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'active')
      `, [bin.location_id, bin.bin_code, bin.latitude, bin.longitude, bin.capacity, bin.type]);
    }

    // 6. Insert Vehicles
    console.log('Inserting vehicles...');
    const fleetConfig = [
      { id: 1, rickshaw_vans: 25, trucks: 4, mini_trucks: 3 },
      { id: 2, rickshaw_vans: 35, trucks: 1, mini_trucks: 0 },
      { id: 3, rickshaw_vans: 6, trucks: 0, mini_trucks: 1 },
      { id: 4, rickshaw_vans: 10, trucks: 1, mini_trucks: 2 },
      { id: 5, rickshaw_vans: 5, trucks: 0, mini_trucks: 1 },
      { id: 6, rickshaw_vans: 12, trucks: 1, mini_trucks: 3 },
      { id: 7, rickshaw_vans: 10, trucks: 0, mini_trucks: 2 }
    ];

    for (const f of fleetConfig) {
      // Rickshaw Vans
      for (let i = 1; i <= f.rickshaw_vans; i++) {
        const plate = `VAN-${f.id}-RV${i}`;
        await client.query(`
          INSERT INTO vehicles (location_id, vehicle_type, plate_number, capacity_tons, trips_per_day, status)
          VALUES ($1, 'rickshaw_van', $2, 0.50, 2, 'active')
        `, [f.id, plate]);
      }
      // Mini Trucks
      for (let i = 1; i <= f.mini_trucks; i++) {
        const plate = `VAN-${f.id}-MT${i}`;
        await client.query(`
          INSERT INTO vehicles (location_id, vehicle_type, plate_number, capacity_tons, trips_per_day, status)
          VALUES ($1, 'mini_truck', $2, 2.50, 4, 'active')
        `, [f.id, plate]);
      }
      // Trucks
      for (let i = 1; i <= f.trucks; i++) {
        const plate = `VAN-${f.id}-TR${i}`;
        const trips = (f.id === 2) ? 10 : 3;
        await client.query(`
          INSERT INTO vehicles (location_id, vehicle_type, plate_number, capacity_tons, trips_per_day, status)
          VALUES ($1, 'truck', $2, 5.00, $3, 'active')
        `, [f.id, plate, trips]);
      }
    }

    // 7. Insert Dumping Hotspots
    console.log('Inserting dumping hotspots...');
    const hotspots = [
      { location_id: 2, latitude: 23.788800, longitude: 90.388200, severity: 'high', description: 'Illegal dumping near Kafrul Thana' },
      { location_id: 7, latitude: 23.794000, longitude: 90.384000, severity: 'critical', description: 'Large-scale waste pileup near Ibrahimpur Bazar' },
      { location_id: 5, latitude: 23.787000, longitude: 90.378000, severity: 'medium', description: 'Dumping near Paschim Kafrul residential blocks' }
    ];

    for (const hs of hotspots) {
      await client.query(`
        INSERT INTO dumping_hotspots (location_id, latitude, longitude, severity, description, reported_count, status)
        VALUES ($1, $2, $3, $4, $5, 15, 'active')
      `, [hs.location_id, hs.latitude, hs.longitude, hs.severity, hs.description]);
    }

    // 8. Insert Heatmap Data
    console.log('Inserting heatmap data...');
    const heatmaps = [
      // Waste Concentration (aligned with specific Waste Bins)
      { location_id: 2, type: 'waste_concentration', lat: 23.7875, lng: 90.3865, intensity: 0.90 },
      { location_id: 2, type: 'waste_concentration', lat: 23.7865, lng: 90.3855, intensity: 0.80 },
      { location_id: 4, type: 'waste_concentration', lat: 23.7895, lng: 90.3925, intensity: 0.90 },
      { location_id: 6, type: 'waste_concentration', lat: 23.7980, lng: 90.3845, intensity: 0.95 },
      
      // Complaint Density (aligned with residential/market areas)
      { location_id: 2, type: 'complaint_density', lat: 23.7885, lng: 90.3890, intensity: 0.95 },
      { location_id: 7, type: 'complaint_density', lat: 23.7950, lng: 90.3835, intensity: 0.85 },
      { location_id: 5, type: 'complaint_density', lat: 23.7860, lng: 90.3790, intensity: 0.90 },
      { location_id: 4, type: 'complaint_density', lat: 23.7898, lng: 90.3910, intensity: 0.80 },

      // Collection Frequency (aligned along main roads)
      { location_id: 2, type: 'collection_frequency', lat: 23.7890, lng: 90.3870, intensity: 0.95 },
      { location_id: 6, type: 'collection_frequency', lat: 23.7955, lng: 90.3835, intensity: 0.90 },
      { location_id: 4, type: 'collection_frequency', lat: 23.7890, lng: 90.3920, intensity: 0.85 },
      { location_id: 5, type: 'collection_frequency', lat: 23.7865, lng: 90.3775, intensity: 0.80 }
    ];

    for (const hm of heatmaps) {
      await client.query(`
        INSERT INTO heatmap_data (location_id, data_type, latitude, longitude, intensity)
        VALUES ($1, $2, $3, $4, $5)
      `, [hm.location_id, hm.type, hm.lat, hm.lng, hm.intensity]);
    }

    // 9. Insert Road Segments matching Bangladesh map (Ward 16)
    console.log('Inserting road segments...');
    const roads = [
      {
        name: 'Kafrul Main Road',
        location_id: 2,
        start_lat: 23.788807, start_lng: 90.388232,
        end_lat: 23.791500, end_lng: 90.388000,
        width_meters: 8.50,
        road_type: 'primary',
        recommended_vehicle: 'truck',
        notes: 'Major commercial artery connecting depot to Kafrul Police Station'
      },
      {
        name: 'Kafrul Post Office Road',
        location_id: 2,
        start_lat: 23.788807, start_lng: 90.388232,
        end_lat: 23.790000, end_lng: 90.387000,
        width_meters: 4.80,
        road_type: 'secondary',
        recommended_vehicle: 'rickshaw_van',
        notes: 'Connects depot to Kafrul Post Office'
      },
      {
        name: 'Central Mosque Road',
        location_id: 2,
        start_lat: 23.791500, start_lng: 90.388000,
        end_lat: 23.789200, end_lng: 90.390000,
        width_meters: 5.50,
        road_type: 'secondary',
        recommended_vehicle: 'rickshaw_van',
        notes: 'Connects Kafrul Police Station to Kafrul Central Mosque'
      },
      {
        name: 'Kafrul School Road',
        location_id: 4,
        start_lat: 23.789200, start_lng: 90.390000,
        end_lat: 23.789000, end_lng: 90.392000,
        width_meters: 3.50,
        road_type: 'residential',
        recommended_vehicle: 'rickshaw_van',
        notes: 'Kafrul school access lane'
      },
      {
        name: 'Kafrul Playground Lane',
        location_id: 4,
        start_lat: 23.789000, start_lng: 90.392000,
        end_lat: 23.790500, end_lng: 90.393000,
        width_meters: 2.50,
        road_type: 'living_street',
        recommended_vehicle: 'manual_collection',
        notes: 'Narrow lane leading to the playground'
      },
      {
        name: 'Kafrul Bazar Road',
        location_id: 2,
        start_lat: 23.788807, start_lng: 90.388232,
        end_lat: 23.787500, end_lng: 90.389000,
        width_meters: 7.20,
        road_type: 'primary',
        recommended_vehicle: 'truck',
        notes: 'Links Hitech depot to Kafrul Bazar'
      },
      {
        name: 'East Shewrapara Road',
        location_id: 5,
        start_lat: 23.787500, start_lng: 90.389000,
        end_lat: 23.786500, end_lng: 90.377500,
        width_meters: 5.00,
        road_type: 'secondary',
        recommended_vehicle: 'rickshaw_van',
        notes: 'Bazar to Pulpar connection'
      },
      {
        name: 'Shewrapara Link Lane',
        location_id: 5,
        start_lat: 23.786500, start_lng: 90.377500,
        end_lat: 23.785000, end_lng: 90.379000,
        width_meters: 2.90,
        road_type: 'living_street',
        recommended_vehicle: 'manual_collection',
        notes: 'Pulpar to West Shewrapara Boundary link'
      },
      {
        name: 'Pulpar Road',
        location_id: 7,
        start_lat: 23.790000, start_lng: 90.387000,
        end_lat: 23.793000, end_lng: 90.383000,
        width_meters: 4.50,
        road_type: 'secondary',
        recommended_vehicle: 'rickshaw_van',
        notes: 'Post Office to Ibrahimpur Central Mosque link'
      },
      {
        name: 'Ibrahimpur Main Road',
        location_id: 6,
        start_lat: 23.793000, start_lng: 90.383000,
        end_lat: 23.797500, end_lng: 90.384000,
        width_meters: 5.20,
        road_type: 'secondary',
        recommended_vehicle: 'rickshaw_van',
        notes: 'Mosque to Ibrahimpur Bazar'
      },
      {
        name: 'Haji Ashraf Ali Road',
        location_id: 6,
        start_lat: 23.797500, start_lng: 90.384000,
        end_lat: 23.795000, end_lng: 90.382000,
        width_meters: 2.20,
        road_type: 'living_street',
        recommended_vehicle: 'manual_collection',
        notes: 'Ibrahimpur Bazar to Girls High School'
      },
      {
        name: 'Kamal Khan Road',
        location_id: 6,
        start_lat: 23.797500, start_lng: 90.384000,
        end_lat: 23.798000, end_lng: 90.381000,
        width_meters: 7.50,
        road_type: 'primary',
        recommended_vehicle: 'truck',
        notes: 'Uttar Ibrahimpur link road'
      },
      {
        name: 'Ibrahimpur Girls School Lane',
        location_id: 7,
        start_lat: 23.793000, start_lng: 90.383000,
        end_lat: 23.795000, end_lng: 90.382000,
        width_meters: 3.10,
        road_type: 'residential',
        recommended_vehicle: 'rickshaw_van',
        notes: 'Mosque to Girls School Bypass'
      }
    ];

    for (const r of roads) {
      await client.query(`
        INSERT INTO road_segments (name, location_id, start_lat, start_lng, end_lat, end_lng, width_meters, road_type, recommended_vehicle, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        r.name, r.location_id,
        r.start_lat, r.start_lng,
        r.end_lat, r.end_lng || r.start_lng, // Safe fallback
        r.width_meters, r.road_type, r.recommended_vehicle, r.notes
      ]);
    }

    // 10. Seed Collection Records with waste breakdowns
    console.log('Inserting collection records...');
    const collections = [
      { location_id: 2, vehicle_id: 1, date: '2026-05-29', plastic: 1.5, food: 5.0, paper: 1.0, glass: 0.4, metal: 0.2, medical: 0.0, construction: 0.5, collector: 'rahim' },
      { location_id: 2, vehicle_id: 2, date: '2026-05-30', plastic: 1.2, food: 4.8, paper: 0.9, glass: 0.3, metal: 0.1, medical: 0.1, construction: 0.8, collector: 'karim' },
      { location_id: 3, vehicle_id: 3, date: '2026-05-31', plastic: 2.0, food: 6.5, paper: 1.5, glass: 0.6, metal: 0.4, medical: 0.0, construction: 1.2, collector: 'jabbar' },
      { location_id: 4, vehicle_id: 1, date: '2026-06-01', plastic: 1.8, food: 5.5, paper: 1.2, glass: 0.5, metal: 0.3, medical: 0.2, construction: 0.0, collector: 'selim' },
      { location_id: 5, vehicle_id: 2, date: '2026-06-02', plastic: 1.0, food: 3.5, paper: 0.7, glass: 0.2, metal: 0.1, medical: 0.0, construction: 0.4, collector: 'bahar' },
      { location_id: 6, vehicle_id: 3, date: '2026-06-03', plastic: 2.5, food: 8.0, paper: 2.0, glass: 0.8, metal: 0.5, medical: 0.3, construction: 2.0, collector: 'robiul' },
      { location_id: 7, vehicle_id: 1, date: '2026-06-04', plastic: 1.4, food: 4.2, paper: 1.1, glass: 0.4, metal: 0.2, medical: 0.1, construction: 0.6, collector: 'rahim' },
      { location_id: 2, vehicle_id: 1, date: '2026-06-05', plastic: 1.6, food: 5.2, paper: 1.3, glass: 0.5, metal: 0.3, medical: 0.0, construction: 0.9, collector: 'karim' }
    ];

    for (const c of collections) {
      const total = c.plastic + c.food + c.paper + c.glass + c.metal + c.medical + c.construction;
      await client.query(`
        INSERT INTO collection_records (
          location_id, vehicle_id, collection_date, waste_tons,
          plastic_tons, food_waste_tons, paper_tons, glass_tons,
          metal_tons, medical_waste_tons, construction_waste_tons,
          route_id, start_time, end_time, landfill_destination, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 1, NOW() - INTERVAL '4 hours', NOW(), 'Aminbazar Landfill', $12)
      `, [
        c.location_id, c.vehicle_id, c.date, total,
        c.plastic, c.food, c.paper, c.glass,
        c.metal, c.medical, c.construction,
        `Collector: ${c.collector}. Scheduled area collection`
      ]);
    }

    // 11. Seed Default Users
    console.log('Seeding default users...');
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash('1234', salt);

    // Manager
    await client.query(
      'INSERT INTO users (email, password_hash, full_name, role, assigned_location_id) VALUES ($1, $2, $3, $4, 2)',
      ['anika@gmail.com', hash, 'Sumaiya Hossain Anika', 'manager']
    );
    console.log('✓ Created Manager: anika@gmail.com / 1234');

    // Citizen
    const citizenRes = await client.query(
      'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['citizen@gmail.com', hash, 'Citizen User', 'citizen']
    );
    const citizenId = citizenRes.rows[0].id;
    console.log('✓ Created Citizen: citizen@gmail.com / 1234');

    await client.query(
      'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4)',
      ['rahim@gmail.com', hash, 'Rahim Citizen', 'citizen']
    );
    console.log('✓ Created Rahim Citizen: rahim@gmail.com / 1234');

    // Default Complaint
    console.log('Inserting default complaint near Dakshin Kafrul...');
    await client.query(`
      INSERT INTO complaints (user_id, title, description, latitude, longitude, address, category, severity, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      citizenId,
      'Overflowing Waste Bin',
      'The secondary collection bin near Kafrul Police Station is completely overflowing. Garbage has spread onto the pavement, causing heavy odor and health concerns for pedestrians.',
      23.789500, // Latitude close to Dakshin Kafrul (23.788807)
      90.389000, // Longitude close to Dakshin Kafrul (90.388232)
      'Near Kafrul Police Station, Dakshin Kafrul, Ward 16',
      'overflowing_bin',
      'high',
      'pending'
    ]);
    console.log('✓ Created Default Complaint');

    await client.query('COMMIT');
    console.log('Database re-seeded successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during reseed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();

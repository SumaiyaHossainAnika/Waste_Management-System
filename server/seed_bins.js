const pool = require('./src/config/db');

async function main() {
  try {
    const check = await pool.query('SELECT COUNT(*) FROM waste_bins');
    const count = parseInt(check.rows[0].count);
    if (count > 0) {
      console.log('Bins already exist, skipping seed.');
      return;
    }

    console.log('Seeding mock waste bins...');
    // Seed for Location 1 (Pallabi, Mirpur 12)
    await pool.query(
      `INSERT INTO waste_bins (location_id, bin_code, latitude, longitude, capacity_liters, current_fill_percent, bin_type) VALUES
      (1, 'BIN-PL-01', 23.831200, 90.362100, 1000, 65, 'standard'),
      (1, 'BIN-PL-02', 23.825800, 90.369200, 1200, 80, 'dumpster'),
      (1, 'BIN-PL-03', 23.834100, 90.366300, 800, 45, 'recycling')`
    );

    // Seed for Location 2 (Hitech, Kafrul)
    await pool.query(
      `INSERT INTO waste_bins (location_id, bin_code, latitude, longitude, capacity_liters, current_fill_percent, bin_type) VALUES
      (2, 'BIN-HK-01', 23.791500, 90.385100, 1000, 70, 'standard'),
      (2, 'BIN-HK-02', 23.785200, 90.391800, 1200, 85, 'dumpster'),
      (2, 'BIN-HK-03', 23.794300, 90.388900, 800, 50, 'recycling')`
    );

    console.log('Waste bins seeded successfully.');
  } catch (err) {
    console.error('Error seeding bins:', err);
  } finally {
    await pool.end();
  }
}

main();

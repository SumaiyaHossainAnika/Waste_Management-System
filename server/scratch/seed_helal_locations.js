// server/scratch/seed_helal_locations.js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const pool = require('../src/config/db');

const locations = [
  // ==================== WARD 2 ====================
  { name: 'BAGUN BARI TEK', ward: '2', lat: 23.8285, lng: 90.3562 },
  { name: 'CHAKULI', ward: '2', lat: 23.8312, lng: 90.3575 },
  { name: 'KALSHI', ward: '2', lat: 23.8290, lng: 90.3601 },
  { name: 'MIRPUR SEC-12 (BLOCK-A)', ward: '2', lat: 23.8325, lng: 90.3590 },
  { name: 'MIRPUR SEC-12 (BLOCK-B)', ward: '2', lat: 23.8331, lng: 90.3615 },
  { name: 'MIRPUR SEC-12 (BLOCK-C)', ward: '2', lat: 23.8278, lng: 90.3645 },
  { name: 'MIRPUR SEC-12 (BLOCK-D)', ward: '2', lat: 23.8310, lng: 90.3630 },
  { name: 'MIRPUR SEC-12 (BLK-TA)DAKSHIN', ward: '2', lat: 23.8295, lng: 90.3610 },
  { name: 'MIRPUR SEC-12 DOHS', ward: '2', lat: 23.8345, lng: 90.3598 },
  { name: 'MIRPUR SEC-12 (BLOCK-E)', ward: '2', lat: 23.8282, lng: 90.3622 },
  { name: 'MIRPUR SEC-12 (BLOCK-DHA)', ward: '2', lat: 23.8320, lng: 90.3620 },
  { name: 'MIRPUR SEC-12 (BLOCK-TA) UTTAR', ward: '2', lat: 23.8305, lng: 90.3605 },
  { name: 'MIRPUR SEC-12 (BLOCK-PA)', ward: '2', lat: 23.8338, lng: 90.3640 },

  // ==================== WARD 3 ====================
  { name: 'MIRPUR SEC-11(BLOCK-C)(PART-1)', ward: '3', lat: 23.8220, lng: 90.3570 },
  { name: 'MIRPUR SEC-11(BLOCK-C)(PART-2)', ward: '3', lat: 23.8235, lng: 90.3595 },
  { name: 'MIRPUR SEC-10 (BLOCK-A)', ward: '3', lat: 23.8198, lng: 90.3585 },
  { name: 'MIRPUR SEC-10 (BLOCK-B)', ward: '3', lat: 23.8205, lng: 90.3610 },
  { name: 'MIRPUR SEC-10 (BLOCK-C)', ward: '3', lat: 23.8245, lng: 90.3625 },
  { name: 'MIRPUR SEC-10 (BLOCK-D)', ward: '3', lat: 23.8258, lng: 90.3640 },

  // ==================== WARD 5 ====================
  { name: 'BAUNIABAD BASTI TINSHEED QTR.', ward: '5', lat: 23.8315, lng: 90.3685 },
  { name: 'MIRPUR SEC-11 (BLOCK-A)', ward: '5', lat: 23.8298, lng: 90.3678 },
  { name: 'MIRPUR SEC-11(BLOCK-B)(PART-1)', ward: '5', lat: 23.8335, lng: 90.3692 },
  { name: 'MIRPUR SEC-11 (BLOCK-E)', ward: '5', lat: 23.8302, lng: 90.3705 },
  { name: 'MIRPUR SEC-11 (BLOCK-D)', ward: '5', lat: 23.8322, lng: 90.3712 },
  { name: 'MIRPUR SEC-11(BLOCK-B)(PART-2)', ward: '5', lat: 23.8341, lng: 90.3701 },
  { name: 'MIRPUR SEC-11 (BLOCK-F)', ward: '5', lat: 23.8288, lng: 90.3715 },
  { name: 'PALASHNAGAR', ward: '5', lat: 23.8280, lng: 90.3690 },

  // ==================== WARD 6 ====================
  { name: 'DOARI PARA', ward: '6', lat: 23.8250, lng: 90.3675 },
  { name: 'EASTERN HOUSING', ward: '6', lat: 23.8225, lng: 90.3682 },
  { name: 'MIRPUR SEC-6 (BLOCK-TA/E)', ward: '6', lat: 23.8205, lng: 90.3672 },
  { name: 'MIRPUR SEC-6 (BLOCK-C)', ward: '6', lat: 23.8238, lng: 90.3698 },
  { name: 'MIRPUR SEC-6 (BLOCK-D)', ward: '6', lat: 23.8215, lng: 90.3705 },
  { name: 'MIRPUR SEC-6 (BLOCK-JA)', ward: '6', lat: 23.8255, lng: 90.3710 },
  { name: 'MIRPUR SEC-6 (BLOCK-JHA)', ward: '6', lat: 23.8242, lng: 90.3708 },
  { name: 'MIRPUR SEC-6 (BLOCK-TA)', ward: '6', lat: 23.8195, lng: 90.3685 },
  { name: 'MIRPUR SEC-7', ward: '6', lat: 23.8200, lng: 90.3700 },
  { name: 'PALLABI (PART-1)', ward: '6', lat: 23.8262, lng: 90.3688 },
  { name: 'PALLABI (EXTENSION)', ward: '6', lat: 23.8258, lng: 90.3695 },
  { name: 'RUPNAGAR TINSHEED', ward: '6', lat: 23.8230, lng: 90.3715 },

  // ==================== WARD 7 ====================
  { name: 'MIRPUR SEC-2(BLOCK-F)', ward: '7', lat: 23.8202, lng: 90.3735 },
  { name: 'MIRPUR SEC-6 (BLOCK-A)', ward: '7', lat: 23.8225, lng: 90.3745 },
  { name: 'MIRPUR SEC-6 (BLOCK-B)', ward: '7', lat: 23.8212, lng: 90.3758 },
  { name: 'MIRPUR SEC-2 (BLOCK-H)', ward: '7', lat: 23.8190, lng: 90.3740 },
  { name: 'MIRPUR SEC-2 (BLOCK-CHA)', ward: '7', lat: 23.8238, lng: 90.3732 },
  { name: 'MIRPUR SEC-2 (BLOCK-C)', ward: '7', lat: 23.8252, lng: 90.3748 },
  { name: 'MIRPUR SEC-2 (BLOCK-A)', ward: '7', lat: 23.8265, lng: 90.3738 },
  { name: 'MIRPUR SEC-2 (BLOCK-D)', ward: '7', lat: 23.8278, lng: 90.3752 },
  { name: 'MIRPUR SEC-2 (BLOCK-E)', ward: '7', lat: 23.8248, lng: 90.3765 },
  { name: 'MIRPUR SEC-2 (BLOCK-G)', ward: '7', lat: 23.8230, lng: 90.3775 },
  { name: 'MIRPUR SEC-2 (BLOCK-B)', ward: '7', lat: 23.8220, lng: 90.3785 },
  { name: 'MIRPUR SEC-2 (BLOCK-NEW-A)', ward: '7', lat: 23.8208, lng: 90.3772 },
  { name: 'ALOBDI', ward: '7', lat: 23.8325, lng: 90.3760 },
  { name: 'RUPNAGAR', ward: '7', lat: 23.8260, lng: 90.3780 },
  { name: 'SHIALBARI', ward: '7', lat: 23.8285, lng: 90.3792 },
  { name: 'RUPALI HOUSING ESTATE', ward: '7', lat: 23.8302, lng: 90.3778 }
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // To prevent ID collisions, let's start Helal's local neighborhood IDs from 100
    let currentId = 100;
    console.log(`Inserting ${locations.length} local locations for Helal's login...`);

    for (const loc of locations) {
      // Generate some realistic values for employee/load
      const employees = Math.floor(Math.random() * 12) + 5; // 5-16
      const load = parseFloat((Math.random() * 5 + 1.5).toFixed(1)); // 1.5-6.5 tons
      const peakDays = ['Saturday', 'Sunday', 'Monday'];
      const peakDay = peakDays[Math.floor(Math.random() * peakDays.length)];

      await client.query(`
        INSERT INTO locations (id, name, latitude, longitude, covered_area, wards, total_employees, daily_load_tons, peak_day, sorting_system, status)
        VALUES ($1, $2, $3, $4, $5, ARRAY[$6], $7, $8, $9, 'Household level waste segregation.', 'active')
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          covered_area = EXCLUDED.covered_area,
          wards = EXCLUDED.wards
      `, [
        currentId,
        loc.name,
        loc.lat,
        loc.lng,
        `${loc.name}, Ward ${loc.ward}`,
        loc.ward,
        employees,
        load,
        peakDay
      ]);
      currentId++;
    }

    await client.query('COMMIT');
    console.log('Helal locations seeded successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding Helal locations:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();

const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { location_id } = req.query;
    let query = `
      SELECT cr.*, l.name as location_name, v.plate_number as vehicle_no, v.vehicle_type 
      FROM collection_records cr
      JOIN locations l ON cr.location_id = l.id
      JOIN vehicles v ON cr.vehicle_id = v.id
    `;
    let params = [];
    if (location_id) {
      query += ' WHERE cr.location_id = $1';
      params.push(location_id);
    }
    query += ' ORDER BY cr.collection_date DESC LIMIT 100';
    const result = await pool.query(query, params);
    res.json({ records: result.rows });
  } catch (err) {
    console.error('[Collection GetAll] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { 
      location_id, vehicle_id, collection_date, 
      plastic_tons, food_waste_tons, paper_tons, glass_tons,
      metal_tons, medical_waste_tons, construction_waste_tons,
      notes 
    } = req.body;
    
    const total_waste = 
      parseFloat(plastic_tons || 0) + 
      parseFloat(food_waste_tons || 0) + 
      parseFloat(paper_tons || 0) + 
      parseFloat(glass_tons || 0) + 
      parseFloat(metal_tons || 0) + 
      parseFloat(medical_waste_tons || 0) + 
      parseFloat(construction_waste_tons || 0);

    const result = await pool.query(
      `INSERT INTO collection_records (
        location_id, vehicle_id, collection_date, waste_tons,
        plastic_tons, food_waste_tons, paper_tons, glass_tons,
        metal_tons, medical_waste_tons, construction_waste_tons,
        landfill_destination, notes
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Aminbazar Landfill', $12) 
       RETURNING *`,
      [
        location_id, vehicle_id, collection_date, total_waste,
        plastic_tons || 0, food_waste_tons || 0, paper_tons || 0, glass_tons || 0,
        metal_tons || 0, medical_waste_tons || 0, construction_waste_tons || 0,
        notes || ''
      ]
    );
    res.status(201).json({ record: result.rows[0] });
  } catch (err) {
    console.error('[Collection Create] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    // Return cumulative summary of waste types
    const summary = await pool.query(`
      SELECT 
        SUM(waste_tons) as total_waste,
        SUM(plastic_tons) as plastic,
        SUM(food_waste_tons) as food_waste,
        SUM(paper_tons) as paper,
        SUM(glass_tons) as glass,
        SUM(metal_tons) as metal,
        SUM(medical_waste_tons) as medical_waste,
        SUM(construction_waste_tons) as construction_waste
      FROM collection_records
    `);
    
    const daily = await pool.query(`
      SELECT 
        collection_date, 
        SUM(waste_tons) as total_waste,
        SUM(plastic_tons) as plastic,
        SUM(food_waste_tons) as food_waste,
        SUM(paper_tons) as paper,
        SUM(glass_tons) as glass,
        SUM(metal_tons) as metal,
        SUM(medical_waste_tons) as medical_waste,
        SUM(construction_waste_tons) as construction_waste
      FROM collection_records
      GROUP BY collection_date 
      ORDER BY collection_date ASC
    `);

    res.json({ 
      summary: summary.rows[0],
      daily: daily.rows 
    });
  } catch (err) {
    console.error('[Collection Analytics] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

exports.deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM collection_records WHERE id = $1', [id]);
    res.json({ message: 'Collection record deleted successfully.' });
  } catch (err) {
    console.error('[Collection Delete] Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

-- EcoRoute: Seed Data from Field Survey
-- Two real survey locations: Pallabi (Mirpur 12) and Hitech (Kafrul)

-- Location 1: Pallabi, Mirpur 12
INSERT INTO locations (name, latitude, longitude, covered_area, wards, total_employees, daily_load_tons, peak_day, sorting_system, problems, improvements, status)
VALUES (
    'Pallabi, Mirpur 12',
    23.828969,
    90.365585,
    'Wards 2, 3, 5, 6 and 7',
    ARRAY['2', '3', '5', '6', '7'],
    110,
    100.00,
    NULL,
    'No formal sorting system - household, commercial, institutional and medical wastes all deposited in same bins. Plastic paper sold separately.',
    ARRAY['Waste dumped illegally', 'Illegal dumping sites identified', 'Insufficient coverage', 'No environmentally friendly operation system', 'Risk of diseases', 'Water pollution', 'Drain blockage'],
    ARRAY['Increase containers and vans', 'Achieve collection efficiency'],
    'active'
);

-- Location 2: Hitech, Kafrul
INSERT INTO locations (name, latitude, longitude, covered_area, wards, total_employees, daily_load_tons, peak_day, sorting_system, problems, improvements, status)
VALUES (
    'Hitech, Kafrul',
    23.788807,
    90.388232,
    '16 no ward full (Kafrul, Ibrahimpur)',
    ARRAY['16'],
    80,
    NULL,
    'Saturday',
    'Plastic paper sold separately.',
    ARRAY['Water leakage from truck'],
    ARRAY['Van improve (motored van, mini truck)'],
    'active'
);

-- Vehicles for Pallabi (65 rickshaw vans + 7 trucks)
INSERT INTO vehicles (location_id, vehicle_type, plate_number, capacity_tons, trips_per_day, status)
SELECT 1, 'rickshaw_van', 'PLB-VAN-' || generate_series, 0.5, 2, 'active'
FROM generate_series(1, 65);

INSERT INTO vehicles (location_id, vehicle_type, plate_number, capacity_tons, trips_per_day, status)
VALUES
    (1, 'truck', 'PLB-TRK-01', 5.00, 10, 'active'),
    (1, 'truck', 'PLB-TRK-02', 5.00, 10, 'active'),
    (1, 'truck', 'PLB-TRK-03', 3.00, 10, 'active'),
    (1, 'truck', 'PLB-TRK-04', 3.00, 10, 'active'),
    (1, 'truck', 'PLB-TRK-05', 7.00, 10, 'active'),
    (1, 'truck', 'PLB-TRK-06', 7.00, 10, 'active'),
    (1, 'truck', 'PLB-TRK-07', 10.00, 10, 'active');

-- Vehicles for Kafrul (35 rickshaw vans)
INSERT INTO vehicles (location_id, vehicle_type, plate_number, capacity_tons, trips_per_day, status)
SELECT 2, 'rickshaw_van', 'KFR-VAN-' || generate_series, 0.5, 2, 'active'
FROM generate_series(1, 35);

-- Dumping hotspots near Pallabi (identified in survey)
INSERT INTO dumping_hotspots (latitude, longitude, severity, description, reported_count, status)
VALUES
    (23.830100, 90.364200, 'high', 'Illegal dumping near drain - Pallabi area', 15, 'active'),
    (23.827500, 90.366800, 'critical', 'Large-scale illegal dumping site - residential area', 23, 'active'),
    (23.829200, 90.363500, 'medium', 'Occasional dumping near market area', 8, 'active');

-- Heatmap data based on survey findings
INSERT INTO heatmap_data (data_type, latitude, longitude, intensity)
VALUES
    ('waste_concentration', 23.828969, 90.365585, 0.95),
    ('waste_concentration', 23.830100, 90.364200, 0.80),
    ('waste_concentration', 23.827500, 90.366800, 0.85),
    ('waste_concentration', 23.829200, 90.363500, 0.60),
    ('waste_concentration', 23.788807, 90.388232, 0.75),
    ('complaint_density', 23.830100, 90.364200, 0.90),
    ('complaint_density', 23.827500, 90.366800, 0.95),
    ('complaint_density', 23.829200, 90.363500, 0.50);

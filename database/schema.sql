-- EcoRoute: GIS-Based Waste Management Optimization System
-- Database Schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table with role-based access
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('manager', 'citizen')),
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Survey locations / waste collection zones
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    covered_area TEXT,
    wards TEXT[],
    total_employees INT DEFAULT 0,
    daily_load_tons DECIMAL(8, 2),
    peak_day VARCHAR(20),
    sorting_system TEXT,
    problems TEXT[],
    improvements TEXT[],
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Waste bins / dump sites
CREATE TABLE waste_bins (
    id SERIAL PRIMARY KEY,
    location_id INT REFERENCES locations(id) ON DELETE CASCADE,
    bin_code VARCHAR(50) UNIQUE,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    capacity_liters INT,
    current_fill_percent INT DEFAULT 0,
    bin_type VARCHAR(50),
    last_collected TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Vehicles (vans, trucks)
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    location_id INT REFERENCES locations(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50) NOT NULL,
    plate_number VARCHAR(20),
    capacity_tons DECIMAL(6, 2),
    trips_per_day INT DEFAULT 2,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Employees
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    location_id INT REFERENCES locations(id) ON DELETE CASCADE,
    name VARCHAR(100),
    role VARCHAR(50),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Waste collection records
CREATE TABLE collection_records (
    id SERIAL PRIMARY KEY,
    location_id INT REFERENCES locations(id) ON DELETE CASCADE,
    vehicle_id INT REFERENCES vehicles(id),
    collection_date DATE NOT NULL,
    waste_tons DECIMAL(8, 2) DEFAULT 0.0,
    plastic_tons DECIMAL(8, 2) DEFAULT 0.0,
    food_waste_tons DECIMAL(8, 2) DEFAULT 0.0,
    paper_tons DECIMAL(8, 2) DEFAULT 0.0,
    glass_tons DECIMAL(8, 2) DEFAULT 0.0,
    metal_tons DECIMAL(8, 2) DEFAULT 0.0,
    medical_waste_tons DECIMAL(8, 2) DEFAULT 0.0,
    construction_waste_tons DECIMAL(8, 2) DEFAULT 0.0,
    route_id INT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    landfill_destination VARCHAR(255) DEFAULT 'Aminbazar Landfill',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Citizen complaints
CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    address TEXT,
    photo_url TEXT,
    category VARCHAR(50),
    severity VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    assigned_to INT REFERENCES employees(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Illegal dumping hotspots
CREATE TABLE dumping_hotspots (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    description TEXT,
    reported_count INT DEFAULT 1,
    last_reported TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Optimized routes
CREATE TABLE optimized_routes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    location_id INT REFERENCES locations(id),
    algorithm VARCHAR(20) NOT NULL,
    waypoints JSONB NOT NULL,
    total_distance_km DECIMAL(8, 2),
    estimated_time_minutes INT,
    vehicle_count INT,
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Road segments for width analysis
CREATE TABLE road_segments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    start_lat DECIMAL(10, 6) NOT NULL,
    start_lng DECIMAL(10, 6) NOT NULL,
    end_lat DECIMAL(10, 6) NOT NULL,
    end_lng DECIMAL(10, 6) NOT NULL,
    width_meters DECIMAL(6, 2),
    road_type VARCHAR(50),
    recommended_vehicle VARCHAR(50),
    notes TEXT,
    location_id INT REFERENCES locations(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Heatmap data cache
CREATE TABLE heatmap_data (
    id SERIAL PRIMARY KEY,
    data_type VARCHAR(50),
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    intensity DECIMAL(5, 2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT NOW()
);

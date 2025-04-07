-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('BE', 'BM', 'SBM', 'ABM', 'RBM', 'ZBM', 'DGM', 'ADMIN', 'SUPER_ADMIN')),
  department VARCHAR(50) NOT NULL,
  headquarters VARCHAR(50) NOT NULL,
  reporting_manager_id INTEGER REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user teams table
CREATE TABLE user_teams (
  manager_id INTEGER REFERENCES users(id),
  team_member_id INTEGER REFERENCES users(id),
  PRIMARY KEY (manager_id, team_member_id)
);

-- Create daily allowances table
CREATE TABLE daily_allowances (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  approved_by INTEGER REFERENCES users(id),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create travel allowances table
CREATE TABLE travel_allowances (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  date DATE NOT NULL,
  from_city VARCHAR(50) NOT NULL,
  to_city VARCHAR(50) NOT NULL,
  distance DECIMAL(10, 2) NOT NULL,
  travel_mode VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  approved_by INTEGER REFERENCES users(id),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cities table
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  headquarters VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at fields
CREATE TRIGGER update_user_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_daily_allowance_modtime BEFORE UPDATE ON daily_allowances FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_travel_allowance_modtime BEFORE UPDATE ON travel_allowances FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_city_modtime BEFORE UPDATE ON cities FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Insert default admin users
INSERT INTO users (username, password, email, full_name, role, department, headquarters, is_active) 
VALUES 
  ('admin', '$2b$10$TLyFEjLgN4FvO/Q1xvTkNO3VzHk.H88p3Hq18yx.KVRzXNZZfSaOS', 'admin@example.com', 'System Admin', 'SUPER_ADMIN', 'Administration', 'Head Office', true),
  ('city-admin', '$2b$10$TLyFEjLgN4FvO/Q1xvTkNO3VzHk.H88p3Hq18yx.KVRzXNZZfSaOS', 'city@example.com', 'City Admin', 'ADMIN', 'Urban Management', 'Metro City', true),
  ('super-admin2', '$2b$10$TLyFEjLgN4FvO/Q1xvTkNO3VzHk.H88p3Hq18yx.KVRzXNZZfSaOS', 'super2@example.com', 'Secondary Super Admin', 'SUPER_ADMIN', 'Global Operations', 'World HQ', true),
  ('admin1', '$2b$10$TLyFEjLgN4FvO/Q1xvTkNO3VzHk.H88p3Hq18yx.KVRzXNZZfSaOS', 'admin1@example.com', 'System Admin', 'SUPER_ADMIN', 'Administration', 'Head Office', true);
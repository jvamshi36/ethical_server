-- Create enum types for user roles and expense status/type
CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'EMPLOYEE', 'TRAINEE');
CREATE TYPE expense_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE expense_type AS ENUM ('TRAVEL', 'SUPPLIES', 'MEALS', 'EQUIPMENT', 'OTHER');

-- Create headquarters table
CREATE TABLE headquarters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    location VARCHAR NOT NULL,
    region VARCHAR NOT NULL,
    country VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    headquarters_id UUID REFERENCES headquarters(id),
    name VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    role user_role DEFAULT 'TRAINEE',
    department_id UUID REFERENCES departments(id),
    headquarters_id UUID REFERENCES headquarters(id),
    daily_allowance_rate DECIMAL(10,2) DEFAULT 0,
    assigned_travel_cities TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    date DATE NOT NULL,
    type expense_type NOT NULL,
    amount FLOAT NOT NULL,
    description VARCHAR NOT NULL,
    attachments TEXT[],
    headquarters_id UUID NOT NULL REFERENCES headquarters(id),
    status expense_status DEFAULT 'PENDING',
    approver_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_headquarters ON users(headquarters_id);
CREATE INDEX idx_expenses_user ON expenses(user_id);
CREATE INDEX idx_expenses_headquarters ON expenses(headquarters_id);
CREATE INDEX idx_expenses_approver ON expenses(approver_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_departments_headquarters ON departments(headquarters_id);
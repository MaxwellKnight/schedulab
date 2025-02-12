-- Drop database if it exists and create a new onesql
DROP DATABASE IF EXISTS schedula;
CREATE DATABASE schedula;
USE schedula;

-- Table: users
CREATE TABLE users (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	google_id VARCHAR(255) UNIQUE,
	picture VARCHAR(2048),
	display_name VARCHAR(255),
	user_role VARCHAR(10) NOT NULL,
	first_name VARCHAR(255) NOT NULL,
	middle_name VARCHAR(255),
	last_name VARCHAR(255) NOT NULL,
	password VARCHAR(255) NOT NULL,
	email VARCHAR(255) UNIQUE,
	last_active TIMESTAMP NULL DEFAULT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: teams
CREATE TABLE teams (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	creator_id 	INT NOT NULL,
	team_code VARCHAR(255) NOT NULL,
	name VARCHAR(255) NOT NULL,
  	notes VARCHAR(1024),
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (creator_id) REFERENCES users(id)
);

CREATE TABLE team_members (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	team_id INT NOT NULL,
	user_id INT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY unique_team_member (team_id, user_id),
	FOREIGN KEY (team_id) REFERENCES teams(id),
	FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: team_roles
CREATE TABLE team_roles (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    UNIQUE KEY unique_team_role (team_id, name)
);

-- Table: member_roles 
CREATE TABLE member_roles (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES team_roles(id),
    UNIQUE KEY unique_member_role (team_id, user_id)
);

-- Table: shift_types
CREATE TABLE shift_types (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id),
  UNIQUE (name)
);

-- Table: schedules
CREATE TABLE schedules (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  published BOOLEAN NOT NULL,
  rating INT,
  notes VARCHAR(1024),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id),
  UNIQUE (team_id, start_date, end_date)
);

-- Table: shifts
CREATE TABLE shifts (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  schedule_id INT NOT NULL,
  shift_type_id INT NOT NULL,
  shift_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  required_count INT NOT NULL,
  actual_count INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id),
  FOREIGN KEY (shift_type_id) REFERENCES shift_types(id)
);

-- Table: time_ranges
CREATE TABLE time_ranges (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  shift_id INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shift_id) REFERENCES shifts(id)
);

-- Table: constraints
CREATE TABLE constraints (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  shift_type_id INT NOT NULL,
  next_id INT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (shift_type_id) REFERENCES shift_types(id),
  FOREIGN KEY (next_id) REFERENCES constraints(id)
);

-- Table: constraint_time_ranges
CREATE TABLE constraint_time_ranges (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  constraint_id INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (constraint_id) REFERENCES constraints(id)
);

-- Table: preference_templates (controls available preference slots)
CREATE TABLE preference_templates (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('draft', 'published', 'closed') NOT NULL DEFAULT 'draft',
  creator INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (creator) REFERENCES users(id),
  UNIQUE (team_id, start_date, end_date)
);

-- Table: time_ranges
CREATE TABLE preference_time_ranges (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  preference_id INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (preference_id) REFERENCES preference_templates(id)
);

-- Table: template_time_slots (available time slots defined by team creator)
CREATE TABLE template_time_slots (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  template_id INT NOT NULL,
  date DATE NOT NULL,
  time_range_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES preference_templates(id) ON DELETE CASCADE,
  FOREIGN KEY (time_range_id) REFERENCES preference_time_ranges(id),
  INDEX idx_template_date (template_id, date)
);

-- Table: member_preferences (members submitted preferences)
CREATE TABLE member_preferences (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  template_id INT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('draft', 'submitted') NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES preference_templates(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE (template_id, user_id)
);

-- Table: preference_selections (members can only select from template slots)
CREATE TABLE preference_selections (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  member_preference_id INT NOT NULL,
  template_time_slot_id INT NOT NULL,
  preference_level INT NOT NULL DEFAULT 3 CHECK (preference_level BETWEEN 1 AND 5),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_preference_id) REFERENCES member_preferences(id) ON DELETE CASCADE,
  FOREIGN KEY (template_time_slot_id) REFERENCES template_time_slots(id),
  UNIQUE (member_preference_id, template_time_slot_id)
);

-- Table: preference_submissions (users submit preferences for a published template)
CREATE TABLE preference_submissions (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  template_id INT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('draft', 'submitted') NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMP NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES preference_templates(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE (template_id, user_id)
);

-- Table: preference_submission_slots (specific slots selected by users)
CREATE TABLE preference_submission_slots (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NOT NULL,
  template_time_slot_id INT NOT NULL,
  preference_level INT NOT NULL DEFAULT 3 CHECK (preference_level BETWEEN 1 AND 5),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES preference_submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (template_time_slot_id) REFERENCES template_time_slots(id),
  UNIQUE (submission_id, template_time_slot_id)
);

-- Table: schedule_preferences (final assigned preferences after CSP optimization)
CREATE TABLE schedule_preferences (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  template_id INT NOT NULL,
  user_id INT NOT NULL,
  template_time_slot_id INT NOT NULL,
  assigned_status ENUM('confirmed', 'alternative', 'rejected') NOT NULL DEFAULT 'alternative',
  assigned_preference_level INT CHECK (assigned_preference_level BETWEEN 1 AND 5),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES preference_templates(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (template_time_slot_id) REFERENCES template_time_slots(id),
  UNIQUE KEY unique_user_slot (user_id, template_time_slot_id)
);

-- Table: vacations
CREATE TABLE vacations (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE (user_id, start_date, end_date)
);

-- Table: schedule_likes
CREATE TABLE schedule_likes (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  schedule_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (schedule_id) REFERENCES schedules(id),
  UNIQUE (user_id, schedule_id)
);

-- Table: shift_likes
CREATE TABLE shift_likes (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  shift_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (shift_id) REFERENCES shifts(id),
  UNIQUE (user_id, shift_id)
);

-- Table: user_shifts
CREATE TABLE user_shifts (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  shift_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (shift_id) REFERENCES shifts(id),
  UNIQUE (user_id, shift_id)
);

-- Table: attendance
CREATE TABLE attendance (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  shift_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (shift_id) REFERENCES shifts(id)
);

-- Table: late
CREATE TABLE late (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  shift_id INT NOT NULL,
  comment VARCHAR(1024) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (shift_id) REFERENCES shifts(id)
);

-- Table: events
CREATE TABLE events (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  event_participants INT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location_id INT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- Table: event_participants
CREATE TABLE event_participants (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Table: locations
CREATE TABLE locations (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  event_id INT NOT NULL,
  longitude DECIMAL(9,6),
  latitude DECIMAL(9,6),
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Table: remarks
CREATE TABLE remarks (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  schedule_id INT NOT NULL,
  content VARCHAR(1024) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id)
);

CREATE TABLE expired (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    token TEXT NOT NULL,              -- Using TEXT instead of VARCHAR for larger tokens
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at),  -- Index for faster cleanup queries
    INDEX idx_token (token(255))        -- Index first 255 characters of token for lookups
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: template_schedules
CREATE TABLE template_schedules (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- Table: template_shifts
CREATE TABLE template_shifts (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  template_schedule_id INT NOT NULL,
  shift_type_id INT NOT NULL,
  shift_name VARCHAR(255) NOT NULL,
  required_count INT NOT NULL,
  day_of_week INT NOT NULL, 
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_schedule_id) REFERENCES template_schedules(id),
  FOREIGN KEY (shift_type_id) REFERENCES shift_types(id)
);

-- Table: template_time_ranges
CREATE TABLE template_time_ranges (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  template_shift_id INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_shift_id) REFERENCES template_shifts(id)
);

-- Table: template_constraints
CREATE TABLE template_constraints (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  template_schedule_id INT NOT NULL,
  shift_type_id INT NOT NULL,
  next_shift_type_id INT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_schedule_id) REFERENCES template_schedules(id),
  FOREIGN KEY (shift_type_id) REFERENCES shift_types(id),
  FOREIGN KEY (next_shift_type_id) REFERENCES shift_types(id)
);

DELIMITER $$

CREATE TRIGGER before_user_insert 
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    -- Set default display name if not provided
    IF NEW.display_name IS NULL OR NEW.display_name = '' THEN
        -- Start with first name
        SET NEW.display_name = NEW.first_name;
        -- Add middle name if exists
        IF NEW.middle_name IS NOT NULL AND NEW.middle_name != '' THEN
            SET NEW.display_name = CONCAT(NEW.display_name, ' ', NEW.middle_name);
        END IF;
        -- Add last name
        SET NEW.display_name = CONCAT(NEW.display_name, ' ', NEW.last_name);
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE update_template_status(
    IN template_id INT,
    IN new_status VARCHAR(10),
    IN team_id INT
)
BEGIN
    IF new_status = 'published' THEN
        -- First update all other templates for the team to draft
        UPDATE preference_templates 
        SET status = 'draft'
        WHERE team_id = team_id 
        AND id != template_id
        AND status = 'published';

        -- Then update the specified template
        UPDATE preference_templates 
        SET status = new_status
        WHERE id = template_id;

    ELSE 
        -- Simply update the status if it's draft or closed
        UPDATE preference_templates 
        SET status = new_status
        WHERE id = template_id;
    END IF;

    COMMIT;
END$$
DELIMITER ;

DELIMITER $$

CREATE FUNCTION is_code_unique(check_code VARCHAR(255)) 
RETURNS BOOLEAN
DETERMINISTIC
BEGIN
    DECLARE existing_count INT;
    SELECT COUNT(*) INTO existing_count FROM teams WHERE team_code = check_code;
    RETURN existing_count = 0;
END$$

CREATE TRIGGER before_team_insert 
BEFORE INSERT ON teams
FOR EACH ROW
BEGIN
    DECLARE generated_code VARCHAR(255);
    DECLARE is_unique BOOLEAN;
    DECLARE attempts INT DEFAULT 0;
    DECLARE max_attempts INT DEFAULT 10;
    generate_unique_code: REPEAT
        -- Reset code generation
        SET @chars := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        SET @code := '';
        SET @i := 0;
        -- Generate random part
        WHILE @i < 6 DO
            SET @code := CONCAT(
                @code, 
                SUBSTRING(@chars, FLOOR(1 + RAND() * 33), 1)
            );
            SET @i := @i + 1;
        END WHILE;
        -- Combine with prefix
        SET generated_code = CONCAT(
            SUBSTRING(NEW.name, 1, 4),
            '-',
            @code
        );
        -- Check if unique
        SET is_unique = is_code_unique(generated_code);
        SET attempts = attempts + 1;
        -- Exit conditions
        IF attempts >= max_attempts THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Failed to generate unique team code after maximum attempts';
        END IF;
    UNTIL is_unique = TRUE END REPEAT generate_unique_code;
    
    SET NEW.team_code = generated_code;
END$$

DELIMITER ;

INSERT INTO users (id, user_role, first_name, middle_name, last_name, password, email, created_at, display_name) VALUES
-- Admin
(2, 'admin', 'Sarah', NULL, 'Johnson', '$2b$12$5M7tsBOu46jTUKJdl6hp7e.PuWzsOTlmIag5hqcbAetbjq8QtzFFa', 'sarah.j@gmail.com', '2024-10-21 10:00:00', 'Sarah Johnson'),
-- Chiefs
(3, 'chief', 'Michael', 'James', 'Smith', '$2b$12$5M7tsBOu46jTUKJdl6hp7e.PuWzsOTlmIag5hqcbAetbjq8QtzFFa', 'michael.s@gmail.com',  '2024-10-21 10:15:00', 'Michael James Smith'),
(4, 'chief', 'Emily', NULL, 'Davis', '$2b$12$5M7tsBOu46jTUKJdl6hp7e.PuWzsOTlmIag5hqcbAetbjq8QtzFFa', 'emily.d@gmail.com', '2024-10-21 10:30:00', 'Emily Davis'),
-- Supervisors
(5, 'supervisor', 'David', NULL, 'Wilson', '$2b$12$5M7tsBOu46jTUKJdl6hp7e.PuWzsOTlmIag5hqcbAetbjq8QtzFFa', 'david.w@gmail.com', '2024-10-21 11:00:00', 'David Wilson'),
(6, 'supervisor', 'Lisa', 'Marie', 'Brown', '$2b$12$5M7tsBOu46jTUKJdl6hp7e.PuWzsOTlmIag5hqcbAetbjq8QtzFFa', 'lisa.b@gmail.com', '2024-10-21 11:30:00', 'Lisa Marie Brown'),
(7, 'supervisor', 'James', NULL, 'Taylor', '$2b$12$5M7tsBOu46jTUKJdl6hp7e.PuWzsOTlmIag5hqcbAetbjq8QtzFFa', 'james.t@gmail.com', '2024-10-21 12:00:00', 'James Taylor'),
-- Managers
(8, 'manager', 'Jessica', 'Ann', 'Martinez', '$2b$12$5M7tsBOu46jTUKJdl6hp7e.PuWzsOTlmIag5hqcbAetbjq8QtzFFa', 'jessica.m@gmail.com',  '2024-10-21 12:30:00', 'Jessica Ann Martinez'),
(9, 'manager', 'Robert', NULL, 'Anderson', '$2b$12$5M7tsBOu46jTUKJdl6hp7e.PuWzsOTlmIag5hqcbAetbjq8QtzFFa', 'robert.a@gmail.com', '2024-10-21 13:00:00', 'Robert Anderson'),
(10, 'manager', 'Michelle', NULL, 'Knight', '$2b$12$5M7tsBOu46jTUKJdl6hp7e.PuWzsOTlmIag5hqcbAetbjq8QtzFFa', 'michelle.k@gmail.com',  '2024-10-21 13:30:00', 'Michelle Thomas'),
-- Regular Users
(11, 'user', 'William', 'John', 'Garcia', '$2b$12$5M7tsBOu46jTUKJdl6hp7e.PuWzsOTlmIag5hqcbAetbjq8QtzFFa', 'william.g@gmail.com',  '2024-10-21 14:00:00', 'William John Garcia'),
(12, 'user', 'Jennifer', NULL, 'Miller', '$2b$12$5M7tsBOu46jTUKJdl6hp7e.PuWzsOTlmIag5hqcbAetbjq8QtzFFa', 'jennifer.m@gmail.com',  '2024-10-21 14:30:00', 'Jennifer Miller'),
(13, 'user', 'Christopher', 'Lee', 'Wong', '$2b$12$5M7tsBOu46jTUKJdl6hp7e.PuWzsOTlmIag5hqcbAetbjq8QtzFFa', 'chris.w@gmail.com',  '2024-10-21 15:00:00', 'Christopher Lee Wong'),
(14, 'user', 'Amanda', NULL, 'Lopez', '$2b$12$5M7tsBOu46jTUKJdl6hp7e.PuWzsOTlmIag5hqcbAetbjq8QtzFFa', 'amanda.l@gmail.com', '2024-10-21 15:30:00', 'Amanda Lopez'),
(15, 'user', 'Daniel', NULL, 'Lee', '$2b$12$5M7tsBOu46jTUKJdl6hp7e.PuWzsOTlmIag5hqcbAetbjq8QtzFFa', 'daniel.l@gmail.com',  '2024-10-21 16:00:00', 'Daniel Lee'),
(16, 'user', 'Rachel', 'Anne', 'Kim', '$2b$12$5M7tsBOu46jTUKJdl6hp7e.PuWzsOTlmIag5hqcbAetbjq8QtzFFa', 'rachel.k@gmail.com',  '2024-10-21 16:30:00', 'Rachel Anne Kim'),
(17, 'user', 'Kevin', NULL, 'Chen', '$2b$12$5M7tsBOu46jTUKJdl6hp7e.PuWzsOTlmIag5hqcbAetbjq8QtzFFa', 'kevin.c@gmail.com', '2024-10-21 17:00:00', 'Kevin Chen'),
(18, 'user', 'Maria', NULL, 'Rodriguez', '$2b$12$5M7tsBOu46jTUKJdl6hp7e.PuWzsOTlmIag5hqcbAetbjq8QtzFFa', 'maria.r@gmail.com',  '2024-10-21 17:30:00', 'Maria Rodriguez'),
(19, 'user', 'Thomas', 'William', 'Wilson', '$2b$12$5M7tsBOu46jTUKJdl6hp7e.PuWzsOTlmIag5hqcbAetbjq8QtzFFa', 'thomas.w@gmail.com', '2024-10-21 18:00:00', 'Thomas William Wilson'),
(20, 'user', 'Sophie', NULL, 'Park', '$2b$12$5M7tsBOu46jTUKJdl6hp7e.PuWzsOTlmIag5hqcbAetbjq8QtzFFa', 'sophie.p@gmail.com',  '2024-10-21 18:30:00', 'Sophie Park');


-- Insert into teams
INSERT INTO teams (creator_id, team_code, name) 
VALUES (10, 'HOSP700', '700');  

-- Insert team members
INSERT INTO team_members (team_id, user_id) 
SELECT 1, id FROM users WHERE id > 2 AND id <= 20;

INSERT IGNORE INTO team_roles (team_id, name) 
VALUES (1, 'admin');

-- Insert the user into team members
INSERT IGNORE INTO team_members (team_id, user_id) 
VALUES (1, 10);

-- Assign the admin role to the user
INSERT IGNORE INTO member_roles (team_id, user_id, role_id)
VALUES (1, 10, (SELECT id FROM team_roles WHERE team_id = 1 AND name = 'admin'));

-- Start transaction to ensure data consistency
START TRANSACTION;

-- Create shift types with team_id
INSERT INTO shift_types (id, name, team_id) VALUES 
(1, 'Regular Staff', 1),
(2, 'Supervisor', 1),
(3, 'Senior Specialist', 1),
(4, 'On-Call Staff', 1),
(5, 'Emergency Response', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);
-- Start transaction to ensure data consistency
START TRANSACTION;

-- Create additional shift types
INSERT INTO shift_types (id, name, team_id) VALUES 
(1, 'Regular Staff', 1),
(2, 'Supervisor', 1),
(3, 'Senior Specialist', 1),
(4, 'On-Call Staff', 1),
(5, 'Emergency Response', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Create template schedule
INSERT INTO template_schedules (team_id, name, start_date, end_date, notes) 
VALUES (
    1, 
    'Hospital Complex Schedule', 
    '2024-10-24', 
    '2024-10-30', 
    'Complex weekly schedule with varying staff requirements, multiple shift types, and specialized weekend coverage'
);

SET @template_schedule_id = LAST_INSERT_ID();

-- Regular Staff - Weekday Morning Shifts (4 staff on Mon-Fri, 3 on weekends)
INSERT INTO template_shifts (template_schedule_id, shift_type_id, shift_name, required_count, day_of_week)
SELECT 
    @template_schedule_id,
    1,
    'Regular Morning',
    CASE 
        WHEN day BETWEEN 1 AND 5 THEN 4  -- Mon-Fri
        ELSE 3                           -- Sat-Sun
    END,
    day
FROM (
    SELECT 0 AS day UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
) days;

-- Regular Staff - Peak Hours (additional staff during busy hours)
INSERT INTO template_shifts (template_schedule_id, shift_type_id, shift_name, required_count, day_of_week)
SELECT 
    @template_schedule_id,
    1,
    'Peak Hours',
    CASE 
        WHEN day BETWEEN 1 AND 5 THEN 2  -- Mon-Fri
        WHEN day = 6 THEN 3              -- Saturday
        ELSE 2                           -- Sunday
    END,
    day
FROM (
    SELECT 0 AS day UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
) days;

-- Senior Specialist Coverage (varying requirements)
INSERT INTO template_shifts (template_schedule_id, shift_type_id, shift_name, required_count, day_of_week)
SELECT 
    @template_schedule_id,
    3,
    'Senior Specialist',
    CASE 
        WHEN day BETWEEN 1 AND 4 THEN 2  -- Mon-Thu
        WHEN day = 5 THEN 3              -- Friday
        ELSE 1                           -- Weekends
    END,
    day
FROM (
    SELECT 0 AS day UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
) days;

-- Emergency Response Team (24/7 coverage)
INSERT INTO template_shifts (template_schedule_id, shift_type_id, shift_name, required_count, day_of_week)
SELECT 
    @template_schedule_id,
    5,
    'Emergency Response',
    CASE 
        WHEN day IN (5, 6) THEN 2        -- Fri-Sat
        ELSE 1                           -- Other days
    END,
    day
FROM (
    SELECT 0 AS day UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
) days;

-- On-Call Staff (night coverage)
INSERT INTO template_shifts (template_schedule_id, shift_type_id, shift_name, required_count, day_of_week)
SELECT 
    @template_schedule_id,
    4,
    'Night On-Call',
    1,
    day
FROM (
    SELECT 0 AS day UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
) days;

-- Insert time ranges with more complex patterns
-- Regular Morning
INSERT INTO template_time_ranges (template_shift_id, start_time, end_time)
SELECT 
    id,
    '07:00',
    '15:30'
FROM template_shifts 
WHERE template_schedule_id = @template_schedule_id 
AND shift_name = 'Regular Morning';

-- Peak Hours (overlapping shifts)
INSERT INTO template_time_ranges (template_shift_id, start_time, end_time)
SELECT 
    id,
    '10:00',
    '18:30'
FROM template_shifts 
WHERE template_schedule_id = @template_schedule_id 
AND shift_name = 'Peak Hours';

-- Senior Specialist (split shifts)
INSERT INTO template_time_ranges (template_shift_id, start_time, end_time)
SELECT 
    id,
    '08:00',
    '12:00'
FROM template_shifts 
WHERE template_schedule_id = @template_schedule_id 
AND shift_name = 'Senior Specialist';

INSERT INTO template_time_ranges (template_shift_id, start_time, end_time)
SELECT 
    id,
    '13:00',
    '17:00'
FROM template_shifts 
WHERE template_schedule_id = @template_schedule_id 
AND shift_name = 'Senior Specialist';

-- Emergency Response (24-hour coverage in 12-hour shifts)
INSERT INTO template_time_ranges (template_shift_id, start_time, end_time)
SELECT 
    id,
    '07:00',
    '19:00'
FROM template_shifts 
WHERE template_schedule_id = @template_schedule_id 
AND shift_name = 'Emergency Response';

-- Night On-Call
INSERT INTO template_time_ranges (template_shift_id, start_time, end_time)
SELECT 
    id,
    '23:00',
    '07:00'
FROM template_shifts 
WHERE template_schedule_id = @template_schedule_id 
AND shift_name = 'Night On-Call';

-- Add complex constraints
-- Cannot work night shift followed by any morning shift
INSERT INTO template_constraints (template_schedule_id, shift_type_id, next_shift_type_id)
SELECT DISTINCT
    @template_schedule_id,
    ts1.shift_type_id,
    ts2.shift_type_id
FROM template_shifts ts1
CROSS JOIN template_shifts ts2
WHERE ts1.template_schedule_id = @template_schedule_id 
AND ts2.template_schedule_id = @template_schedule_id
AND ts1.shift_name IN ('Night On-Call', 'Emergency Response')
AND ts2.shift_name IN ('Regular Morning', 'Senior Specialist');

-- Maximum one Emergency Response shift per 48 hours
INSERT INTO template_constraints (template_schedule_id, shift_type_id, next_shift_type_id)
SELECT DISTINCT
    @template_schedule_id,
    shift_type_id,
    shift_type_id
FROM template_shifts
WHERE template_schedule_id = @template_schedule_id 
AND shift_name = 'Emergency Response';

-- Verify the data
SELECT 'Complex Template Schedule Created:' as message;
SELECT * FROM template_schedules WHERE id = @template_schedule_id;

SELECT 'Complex Shifts Created:' as message;
SELECT 
    ts.*, 
    st.name as shift_type_name,
    CASE 
        WHEN day_of_week = 0 THEN 'Sunday'
        WHEN day_of_week = 1 THEN 'Monday'
        WHEN day_of_week = 2 THEN 'Tuesday'
        WHEN day_of_week = 3 THEN 'Wednesday'
        WHEN day_of_week = 4 THEN 'Thursday'
        WHEN day_of_week = 5 THEN 'Friday'
        WHEN day_of_week = 6 THEN 'Saturday'
    END as day_name
FROM template_shifts ts
JOIN shift_types st ON ts.shift_type_id = st.id
WHERE template_schedule_id = @template_schedule_id
ORDER BY day_of_week, shift_name;

SELECT 'Time Ranges Created:' as message;
SELECT 
    tr.*, 
    ts.shift_name,
    st.name as shift_type_name
FROM template_time_ranges tr
JOIN template_shifts ts ON tr.template_shift_id = ts.id
JOIN shift_types st ON ts.shift_type_id = st.id
WHERE ts.template_schedule_id = @template_schedule_id
ORDER BY ts.day_of_week, ts.shift_name, tr.start_time;

COMMIT;

-- Start transaction to ensure data consistency
START TRANSACTION;

-- Create new template schedule
INSERT INTO template_schedules (team_id, name, start_date, end_date, notes) 
VALUES (
    1, 
    'Hospital Complex Weekly Template', 
    '2024-11-11', 
    '2024-11-17', 
    'Comprehensive weekly template with varied shift patterns, specialized rotations, and floating staff coverage'
);

SET @template_schedule_id = LAST_INSERT_ID();

-- 1. Day Shift Patterns (Multiple start times for better coverage)
-- Early Morning Team
INSERT INTO template_shifts (template_schedule_id, shift_type_id, shift_name, required_count, day_of_week)
SELECT 
    @template_schedule_id,
    1, -- Regular Staff
    'Early Morning',
    CASE 
        WHEN day BETWEEN 1 AND 5 THEN 3  -- Mon-Fri
        ELSE 2                           -- Weekends
    END,
    day
FROM (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) numbers(day);

-- Core Day Team
INSERT INTO template_shifts (template_schedule_id, shift_type_id, shift_name, required_count, day_of_week)
SELECT 
    @template_schedule_id,
    1, -- Regular Staff
    'Core Day',
    CASE 
        WHEN day BETWEEN 1 AND 5 THEN 4  -- Mon-Fri
        WHEN day = 6 THEN 3              -- Saturday
        ELSE 2                           -- Sunday
    END,
    day
FROM (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) numbers(day);

-- 2. Specialized Coverage
-- Senior Specialists (split shifts for better coverage)
INSERT INTO template_shifts (template_schedule_id, shift_type_id, shift_name, required_count, day_of_week)
SELECT 
    @template_schedule_id,
    3, -- Senior Specialist
    'Morning Specialist',
    CASE 
        WHEN day BETWEEN 1 AND 5 THEN 2  -- Mon-Fri
        ELSE 1                           -- Weekends
    END,
    day
FROM (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) numbers(day);

INSERT INTO template_shifts (template_schedule_id, shift_type_id, shift_name, required_count, day_of_week)
SELECT 
    @template_schedule_id,
    3, -- Senior Specialist
    'Evening Specialist',
    CASE 
        WHEN day BETWEEN 1 AND 5 THEN 2  -- Mon-Fri
        WHEN day = 5 THEN 3              -- Extra coverage Friday evening
        ELSE 1                           -- Weekends
    END,
    day
FROM (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) numbers(day);

-- 3. Emergency Response Teams
-- Primary Emergency Team
INSERT INTO template_shifts (template_schedule_id, shift_type_id, shift_name, required_count, day_of_week)
SELECT 
    @template_schedule_id,
    5, -- Emergency Response
    'Primary Emergency',
    CASE 
        WHEN day IN (5, 6) THEN 3        -- Fri-Sat (higher coverage)
        ELSE 2                           -- Other days
    END,
    day
FROM (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) numbers(day);

-- Backup Emergency Team
INSERT INTO template_shifts (template_schedule_id, shift_type_id, shift_name, required_count, day_of_week)
SELECT 
    @template_schedule_id,
    5, -- Emergency Response
    'Backup Emergency',
    CASE 
        WHEN day IN (5, 6) THEN 2        -- Fri-Sat
        ELSE 1                           -- Other days
    END,
    day
FROM (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) numbers(day);

-- 4. Night Coverage
-- Primary Night Team
INSERT INTO template_shifts (template_schedule_id, shift_type_id, shift_name, required_count, day_of_week)
SELECT 
    @template_schedule_id,
    4, -- On-Call Staff
    'Primary Night',
    CASE 
        WHEN day IN (5, 6) THEN 3        -- Fri-Sat
        ELSE 2                           -- Other days
    END,
    day
FROM (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) numbers(day);

-- Night Float Team
INSERT INTO template_shifts (template_schedule_id, shift_type_id, shift_name, required_count, day_of_week)
SELECT 
    @template_schedule_id,
    4, -- On-Call Staff
    'Night Float',
    1,  -- Consistent single coverage
    day
FROM (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) numbers(day);

-- 5. Supervisor Coverage
INSERT INTO template_shifts (template_schedule_id, shift_type_id, shift_name, required_count, day_of_week)
SELECT 
    @template_schedule_id,
    2, -- Supervisor
    'Shift Supervisor',
    CASE 
        WHEN day BETWEEN 1 AND 5 THEN 2  -- Mon-Fri
        ELSE 1                           -- Weekends
    END,
    day
FROM (SELECT 0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6) numbers(day);

-- Add time ranges for each shift type
-- Early Morning Team (6:00 AM start)
INSERT INTO template_time_ranges (template_shift_id, start_time, end_time)
SELECT 
    id,
    '06:00',
    '14:30'
FROM template_shifts 
WHERE template_schedule_id = @template_schedule_id 
AND shift_name = 'Early Morning';

-- Core Day Team (8:00 AM start)
INSERT INTO template_time_ranges (template_shift_id, start_time, end_time)
SELECT 
    id,
    '08:00',
    '16:30'
FROM template_shifts 
WHERE template_schedule_id = @template_schedule_id 
AND shift_name = 'Core Day';

-- Morning Specialist (Split shift morning)
INSERT INTO template_time_ranges (template_shift_id, start_time, end_time)
SELECT 
    id,
    '07:00',
    '12:00'
FROM template_shifts 
WHERE template_schedule_id = @template_schedule_id 
AND shift_name = 'Morning Specialist';

-- Evening Specialist (Split shift evening)
INSERT INTO template_time_ranges (template_shift_id, start_time, end_time)
SELECT 
    id,
    '13:00',
    '21:00'
FROM template_shifts 
WHERE template_schedule_id = @template_schedule_id 
AND shift_name = 'Evening Specialist';

-- Primary Emergency Team (12-hour shifts)
INSERT INTO template_time_ranges (template_shift_id, start_time, end_time)
SELECT 
    id,
    '07:00',
    '19:00'
FROM template_shifts 
WHERE template_schedule_id = @template_schedule_id 
AND shift_name = 'Primary Emergency';

-- Backup Emergency Team (10-hour peak coverage)
INSERT INTO template_time_ranges (template_shift_id, start_time, end_time)
SELECT 
    id,
    '10:00',
    '20:00'
FROM template_shifts 
WHERE template_schedule_id = @template_schedule_id 
AND shift_name = 'Backup Emergency';

-- Primary Night Team
INSERT INTO template_time_ranges (template_shift_id, start_time, end_time)
SELECT 
    id,
    '19:00',
    '07:00'
FROM template_shifts 
WHERE template_schedule_id = @template_schedule_id 
AND shift_name = 'Primary Night';

-- Night Float Team (shorter overlap shift)
INSERT INTO template_time_ranges (template_shift_id, start_time, end_time)
SELECT 
    id,
    '23:00',
    '07:00'
FROM template_shifts 
WHERE template_schedule_id = @template_schedule_id 
AND shift_name = 'Night Float';

-- Shift Supervisor (extended hours)
INSERT INTO template_time_ranges (template_shift_id, start_time, end_time)
SELECT 
    id,
    '07:00',
    '19:00'
FROM template_shifts 
WHERE template_schedule_id = @template_schedule_id 
AND shift_name = 'Shift Supervisor';

-- Add complex scheduling constraints
-- 1. No back-to-back night shifts followed by day shifts
INSERT INTO template_constraints (template_schedule_id, shift_type_id, next_shift_type_id)
SELECT DISTINCT
    @template_schedule_id,
    ts1.shift_type_id,
    ts2.shift_type_id
FROM template_shifts ts1
CROSS JOIN template_shifts ts2
WHERE ts1.template_schedule_id = @template_schedule_id 
AND ts2.template_schedule_id = @template_schedule_id
AND ts1.shift_name IN ('Primary Night', 'Night Float')
AND ts2.shift_name IN ('Early Morning', 'Core Day', 'Morning Specialist');

-- 2. Emergency Response constraints (maximum one 12-hour shift per 24 hours)
INSERT INTO template_constraints (template_schedule_id, shift_type_id, next_shift_type_id)
SELECT DISTINCT
    @template_schedule_id,
    ts1.shift_type_id,
    ts2.shift_type_id
FROM template_shifts ts1
CROSS JOIN template_shifts ts2
WHERE ts1.template_schedule_id = @template_schedule_id 
AND ts2.template_schedule_id = @template_schedule_id
AND ts1.shift_name IN ('Primary Emergency', 'Backup Emergency')
AND ts2.shift_name IN ('Primary Emergency', 'Backup Emergency');

-- 3. Specialist rotation constraints (minimum 8 hours between split shifts)
INSERT INTO template_constraints (template_schedule_id, shift_type_id, next_shift_type_id)
SELECT DISTINCT
    @template_schedule_id,
    ts1.shift_type_id,
    ts2.shift_type_id
FROM template_shifts ts1
CROSS JOIN template_shifts ts2
WHERE ts1.template_schedule_id = @template_schedule_id 
AND ts2.template_schedule_id = @template_schedule_id
AND ts1.shift_name = 'Evening Specialist'
AND ts2.shift_name = 'Morning Specialist';

COMMIT;

INSERT INTO teams (id, creator_id, name, team_code) VALUES
(2, 3, 'Surgery Department', 'SURG-XYZ123'),
(3, 4, 'Emergency Room', 'EMER-ABC456'),
(4, 5, 'Pediatrics', 'PEDI-DEF789'),
(5, 8, 'Cardiology', 'CARD-GHI012'),
(6, 9, 'Neurology', 'NEUR-JKL345'),
(7, 10, 'Oncology', 'ONCO-MNO678'),
(8, 11, 'Radiology', 'RADI-PQR901'),
(9, 12, 'Laboratory', 'LAB-STU234'),
(10, 13, 'Pharmacy', 'PHAR-VWX567');

-- Associate users with multiple teams
-- This ensures each user is both an admin in some teams and a regular member in others
INSERT INTO team_members (team_id, user_id) VALUES
-- Team 1 (Hospital 700) members already added in previous script

-- Team 2 (Surgery Department) members
(2, 4), -- Emily Davis
(2, 5), -- David Wilson
(2, 8), -- Jessica Martinez
(2, 11), -- William Garcia
(2, 14), -- Amanda Lopez
(2, 17), -- Kevin Chen

-- Team 3 (Emergency Room) members
(3, 3), -- Michael Smith
(3, 6), -- Lisa Brown
(3, 9), -- Robert Anderson
(3, 12), -- Jennifer Miller
(3, 15), -- Daniel Lee
(3, 18), -- Maria Rodriguez

-- Team 4 (Pediatrics) members
(4, 4), -- Emily Davis
(4, 7), -- James Taylor
(4, 10), -- Michelle Thomas
(4, 13), -- Christopher Wong
(4, 16), -- Rachel Kim
(4, 19), -- Thomas Wilson

-- Team 5 (Cardiology) members
(5, 3), -- Michael Smith
(5, 6), -- Lisa Brown
(5, 9), -- Robert Anderson
(5, 12), -- Jennifer Miller
(5, 15), -- Daniel Lee
(5, 20), -- Sophie Park

-- Team 6 (Neurology) members
(6, 4), -- Emily Davis
(6, 7), -- James Taylor
(6, 10), -- Michelle Thomas
(6, 13), -- Christopher Wong
(6, 16), -- Rachel Kim
(6, 19), -- Thomas Wilson

-- Team 7 (Oncology) members
(7, 5), -- David Wilson
(7, 8), -- Jessica Martinez
(7, 11), -- William Garcia
(7, 14), -- Amanda Lopez
(7, 17), -- Kevin Chen
(7, 20), -- Sophie Park

-- Team 8 (Radiology) members
(8, 3), -- Michael Smith
(8, 6), -- Lisa Brown
(8, 9), -- Robert Anderson
(8, 12), -- Jennifer Miller
(8, 15), -- Daniel Lee
(8, 18), -- Maria Rodriguez

-- Team 9 (Laboratory) members
(9, 4), -- Emily Davis
(9, 7), -- James Taylor
(9, 10), -- Michelle Thomas
(9, 13), -- Christopher Wong
(9, 16), -- Rachel Kim
(9, 19), -- Thomas Wilson

-- Team 10 (Pharmacy) members
(10, 5), -- David Wilson
(10, 8), -- Jessica Martinez
(10, 11), -- William Garcia
(10, 14), -- Amanda Lopez
(10, 17), -- Kevin Chen
(10, 20); -- Sophie Park

-- Current Week Templates (Week 49, 2024)
INSERT INTO preference_templates (team_id, name, start_date, end_date, status, creator) VALUES 
(1, 'Regular Week 49', '2024-12-02', '2024-12-08', 'published', 3),
(2, 'Support Team Week 49', '2024-12-02', '2024-12-08', 'published', 4),
(3, 'Operations Week 49', '2024-12-02', '2024-12-08', 'draft', 5),
(4, 'Maintenance Week 49', '2024-12-02', '2024-12-08', 'draft', 6);

-- Store template IDs
SET @regular_w49 = (SELECT LAST_INSERT_ID());
SET @support_w49 = @regular_w49 + 1;
SET @ops_w49 = @regular_w49 + 2;
SET @maint_w49 = @regular_w49 + 3;

-- Pre-Holiday Templates (Week 50-51, 2024)
INSERT INTO preference_templates (team_id, name, start_date, end_date, status, creator) VALUES 
(1, 'Pre-Holiday Week 50', '2024-12-09', '2024-12-15', 'draft', 3),
(2, 'Pre-Holiday Week 51', '2024-12-16', '2024-12-22', 'draft', 4),
(3, 'Extended Support Week 50-51', '2024-12-09', '2024-12-22', 'draft', 5);

SET @pre_holiday_w50 = (SELECT LAST_INSERT_ID());
SET @pre_holiday_w51 = @pre_holiday_w50 + 1;
SET @extended_support = @pre_holiday_w50 + 2;

-- Holiday Season Templates (Week 52, 2024 - Week 1, 2025)
INSERT INTO preference_templates (team_id, name, start_date, end_date, status, creator) VALUES 
(1, 'Christmas Week Schedule', '2024-12-23', '2024-12-29', 'draft', 3),
(2, 'New Year Week Schedule', '2024-12-30', '2025-01-05', 'draft', 4),
(3, 'Holiday Support Coverage', '2024-12-23', '2025-01-05', 'draft', 5),
(4, 'Holiday Maintenance', '2024-12-23', '2025-01-05', 'draft', 6);

SET @christmas_week = (SELECT LAST_INSERT_ID());
SET @new_year_week = @christmas_week + 1;
SET @holiday_support = @christmas_week + 2;
SET @holiday_maint = @christmas_week + 3;

-- Future Templates (January - March 2025)
INSERT INTO preference_templates (team_id, name, start_date, end_date, status, creator) VALUES 
(1, 'January First Week', '2025-01-06', '2025-01-12', 'draft', 3),
(2, 'January Second Week', '2025-01-13', '2025-01-19', 'draft', 4),
(1, 'February Special Project', '2025-02-03', '2025-02-16', 'draft', 3),
(3, 'March Planning Week', '2025-03-03', '2025-03-09', 'draft', 5),
(4, 'Spring Maintenance', '2025-03-17', '2025-03-30', 'draft', 6);

SET @jan_w1 = (SELECT LAST_INSERT_ID());
SET @jan_w2 = @jan_w1 + 1;
SET @feb_special = @jan_w1 + 2;
SET @march_planning = @jan_w1 + 3;
SET @spring_maint = @jan_w1 + 4;

-- Now let's create time ranges for each template type

-- Regular working hours (8-hour shifts)
DELIMITER //
CREATE PROCEDURE insert_regular_time_ranges(IN template_id INT)
BEGIN
    INSERT INTO preference_time_ranges (preference_id, start_time, end_time) VALUES
    (template_id, '07:00', '15:00'),
    (template_id, '08:00', '16:00'),
    (template_id, '09:00', '17:00'),
    (template_id, '15:00', '23:00'),
    (template_id, '23:00', '07:00');
END //
DELIMITER ;

-- Extended working hours (10-hour shifts)
DELIMITER //
CREATE PROCEDURE insert_extended_time_ranges(IN template_id INT)
BEGIN
    INSERT INTO preference_time_ranges (preference_id, start_time, end_time) VALUES
    (template_id, '06:00', '16:00'),
    (template_id, '08:00', '18:00'),
    (template_id, '10:00', '20:00'),
    (template_id, '14:00', '00:00'),
    (template_id, '20:00', '06:00');
END //
DELIMITER ;

-- Flexible working hours (6-hour shifts)
DELIMITER //
CREATE PROCEDURE insert_flexible_time_ranges(IN template_id INT)
BEGIN
    INSERT INTO preference_time_ranges (preference_id, start_time, end_time) VALUES
    (template_id, '08:00', '14:00'),
    (template_id, '10:00', '16:00'),
    (template_id, '12:00', '18:00'),
    (template_id, '14:00', '20:00'),
    (template_id, '16:00', '22:00');
END //
DELIMITER ;

-- Insert time ranges for all templates
CALL insert_regular_time_ranges(@regular_w49);
CALL insert_extended_time_ranges(@support_w49);
CALL insert_flexible_time_ranges(@ops_w49);
CALL insert_regular_time_ranges(@maint_w49);

CALL insert_regular_time_ranges(@pre_holiday_w50);
CALL insert_extended_time_ranges(@pre_holiday_w51);
CALL insert_flexible_time_ranges(@extended_support);

CALL insert_flexible_time_ranges(@christmas_week);
CALL insert_extended_time_ranges(@new_year_week);
CALL insert_regular_time_ranges(@holiday_support);
CALL insert_flexible_time_ranges(@holiday_maint);

CALL insert_regular_time_ranges(@jan_w1);
CALL insert_regular_time_ranges(@jan_w2);
CALL insert_extended_time_ranges(@feb_special);
CALL insert_flexible_time_ranges(@march_planning);
CALL insert_regular_time_ranges(@spring_maint);

-- Create a procedure to generate time slots
DELIMITER //
CREATE PROCEDURE generate_time_slots(IN template_id INT, IN start_date DATE, IN end_date DATE)
BEGIN
    DECLARE curr_date DATE;
    SET curr_date = start_date;
    
    WHILE curr_date <= end_date DO
        INSERT INTO template_time_slots (template_id, date, time_range_id)
        SELECT 
            template_id,
            curr_date,
            pr.id
        FROM preference_time_ranges pr 
        WHERE pr.preference_id = template_id;
        
        SET curr_date = DATE_ADD(curr_date, INTERVAL 1 DAY);
    END WHILE;
END //
DELIMITER ;

-- Generate time slots for all templates
CALL generate_time_slots(@regular_w49, '2024-12-02', '2024-12-08');
CALL generate_time_slots(@support_w49, '2024-12-02', '2024-12-08');
CALL generate_time_slots(@ops_w49, '2024-12-02', '2024-12-08');
CALL generate_time_slots(@maint_w49, '2024-12-02', '2024-12-08');

CALL generate_time_slots(@pre_holiday_w50, '2024-12-09', '2024-12-15');
CALL generate_time_slots(@pre_holiday_w51, '2024-12-16', '2024-12-22');
CALL generate_time_slots(@extended_support, '2024-12-09', '2024-12-22');

CALL generate_time_slots(@christmas_week, '2024-12-23', '2024-12-29');
CALL generate_time_slots(@new_year_week, '2024-12-30', '2025-01-05');
CALL generate_time_slots(@holiday_support, '2024-12-23', '2025-01-05');
CALL generate_time_slots(@holiday_maint, '2024-12-23', '2025-01-05');

CALL generate_time_slots(@jan_w1, '2025-01-06', '2025-01-12');
CALL generate_time_slots(@jan_w2, '2025-01-13', '2025-01-19');
CALL generate_time_slots(@feb_special, '2025-02-03', '2025-02-16');
CALL generate_time_slots(@march_planning, '2025-03-03', '2025-03-09');
CALL generate_time_slots(@spring_maint, '2025-03-17', '2025-03-30');

-- Generate member preferences for each template
INSERT INTO member_preferences (template_id, user_id, status, submitted_at, notes)
SELECT 
    t.id as template_id,
    tm.user_id,
    CASE 
        WHEN t.status = 'published' AND RAND() < 0.8 THEN 'submitted'
        WHEN t.status = 'published' THEN 'draft'
        ELSE 'draft'
    END as status,
    CASE 
        WHEN t.status = 'published' AND RAND() < 0.8 
        THEN DATE_SUB(t.start_date, INTERVAL FLOOR(RAND() * 14) DAY)
        ELSE NULL
    END as submitted_at,
    CASE 
        WHEN RAND() < 0.2 THEN 'Prefer morning shifts'
        WHEN RAND() < 0.4 THEN 'Available for night shifts'
        WHEN RAND() < 0.6 THEN 'Flexible with timings'
        WHEN RAND() < 0.8 THEN 'Weekend availability limited'
        ELSE NULL
    END as notes
FROM preference_templates t
JOIN team_members tm ON t.team_id = tm.team_id;

-- Generate preference selections
INSERT INTO preference_selections (member_preference_id, template_time_slot_id, preference_level)
SELECT 
    mp.id,
    ts.id,
    CASE
        WHEN HOUR(ptr.start_time) BETWEEN 7 AND 11 THEN FLOOR(3 + RAND() * 3)
        WHEN HOUR(ptr.start_time) BETWEEN 12 AND 17 THEN FLOOR(2 + RAND() * 4)
        WHEN HOUR(ptr.start_time) >= 18 OR HOUR(ptr.start_time) <= 5 THEN FLOOR(1 + RAND() * 3)
        ELSE FLOOR(1 + RAND() * 5)
    END
FROM member_preferences mp
JOIN template_time_slots ts ON ts.template_id = mp.template_id
JOIN preference_time_ranges ptr ON ptr.id = ts.time_range_id
WHERE mp.status = 'submitted';

-- Clean up procedures
DROP PROCEDURE IF EXISTS insert_regular_time_ranges;
DROP PROCEDURE IF EXISTS insert_extended_time_ranges;
DROP PROCEDURE IF EXISTS insert_flexible_time_ranges;
DROP PROCEDURE IF EXISTS generate_time_slots;

-- Insert preference submissions based on submitted member preferences
INSERT INTO preference_submissions (
    template_id, 
    user_id, 
    status, 
    submitted_at, 
    notes,
    created_at,
    updated_at
)
SELECT 
    template_id, 
    user_id, 
    status,
    submitted_at,
    notes,
    CASE 
        WHEN submitted_at IS NOT NULL THEN submitted_at
        ELSE DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY)
    END as created_at,
    CASE 
        WHEN submitted_at IS NOT NULL THEN submitted_at
        ELSE DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY)
    END as updated_at
FROM member_preferences
WHERE status = 'submitted';

-- Insert corresponding submission slots based on the preference selections
INSERT INTO preference_submission_slots (
    submission_id, 
    template_time_slot_id, 
    preference_level,
    created_at
)
SELECT 
    ps.id,
    ps2.template_time_slot_id,
    ps2.preference_level,
    ps.created_at
FROM preference_submissions ps
JOIN member_preferences mp ON mp.template_id = ps.template_id AND mp.user_id = ps.user_id
JOIN preference_selections ps2 ON ps2.member_preference_id = mp.id;

-- Update submission status for some templates to simulate progress
UPDATE preference_submissions 
SET status = 'draft',
    submitted_at = NULL
WHERE RAND() < 0.2;  -- 20% will be drafts

-- Update some submissions with notes
UPDATE preference_submissions 
SET notes = CASE 
    WHEN RAND() < 0.2 THEN 'Prefer morning shifts due to childcare'
    WHEN RAND() < 0.4 THEN 'Available for overtime if needed'
    WHEN RAND() < 0.6 THEN 'Can cover weekend shifts this month'
    WHEN RAND() < 0.8 THEN 'Flexible with start times'
    ELSE NULL
END
WHERE RAND() < 0.4;  -- 40% will have notes

-- Add some variation in preference levels for submission slots
UPDATE preference_submission_slots pss
JOIN template_time_slots tts ON pss.template_time_slot_id = tts.id
JOIN preference_time_ranges ptr ON tts.time_range_id = ptr.id
SET pss.preference_level = 
    CASE
        -- Higher preference for standard business hours
        WHEN HOUR(ptr.start_time) BETWEEN 8 AND 17 THEN FLOOR(3 + RAND() * 3)
        -- Lower preference for very early or late hours
        WHEN HOUR(ptr.start_time) < 6 OR HOUR(ptr.start_time) >= 22 THEN FLOOR(1 + RAND() * 3)
        -- Medium preference for other times
        ELSE FLOOR(2 + RAND() * 3)
    END
WHERE RAND() < 0.7;  -- Adjust 70% of the preferences

-- Update some submission timestamps to create a more realistic pattern
UPDATE preference_submissions
SET submitted_at = 
    CASE 
        WHEN status = 'submitted' THEN 
            DATE_SUB(
                (SELECT start_date FROM preference_templates WHERE id = template_id), 
                INTERVAL FLOOR(RAND() * 14) DAY
            )
        ELSE NULL
    END
WHERE status = 'submitted';

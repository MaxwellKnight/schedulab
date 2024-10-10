
--
-- Host: localhost    Database: shifty
-- ------------------------------------------------------
-- Server version	8.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `daily_preferences`
--
DROP DATABASE IF EXISTS shifty;
CREATE DATABASE shifty;
USE shifty;

-- Table: users
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_role VARCHAR(10) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  middle_name VARCHAR(255),
  last_name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  student BOOLEAN NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: preferences
CREATE TABLE preferences (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes VARCHAR(1024),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE (user_id, start_date, end_date)
);

-- Table: daily_preferences
CREATE TABLE daily_preferences (
  id INT NOT NULL AUTO_INCREMENT,
  date DATE NOT NULL,
  preference_id INT NOT NULL,
  morning BOOLEAN,
  noon BOOLEAN,
  night BOOLEAN,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, date),
  FOREIGN KEY (preference_id) REFERENCES preferences(id),
  UNIQUE (date, preference_id)
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

-- Table: schedules
CREATE TABLE schedules (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  published BOOLEAN NOT NULL,
  rating INT,
  notes VARCHAR(1024),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (start_date, end_date)
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

-- Table: shifts
CREATE TABLE shifts (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  schedule_id INT NOT NULL,
  shift_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  required_count INT NOT NULL,
  actual_count INT NOT NULL,
  shift_type INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES schedules(id)
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
  event_participants INT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location_id INT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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

-- Table: feedback
CREATE TABLE feedback (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content VARCHAR(1024) NOT NULL,
  sentiment VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: template_schedules
CREATE TABLE template_schedules (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: template_shifts
CREATE TABLE template_shifts (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  schedule_id INT NOT NULL,
  duration INT NOT NULL,
  required_count INT NOT NULL,
  shift_type INT NOT NULL,
  shift_name VARCHAR(255) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (schedule_id) REFERENCES template_schedules(id)
);

-- Table: expired
CREATE TABLE expired (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMIT;

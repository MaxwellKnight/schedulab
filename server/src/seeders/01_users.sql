SET AUTOCOMMIT = 0;
START TRANSACTION;

INSERT INTO users (user_role, first_name, middle_name, last_name, password, email, student, created_at) VALUES
('admin', 'John', 'A', 'Doe', 'password123', 'john.doe@example.com', FALSE, NOW()),
('user', 'Jane', 'B', 'Smith', 'password123', 'jane.smith@example.com', TRUE, NOW()),
('manager', 'Alice', 'C', 'Johnson', 'password123', 'alice.johnson@example.com', FALSE, NOW()),
('user', 'Bob', 'D', 'Brown', 'password123', 'bob.brown@example.com', TRUE, NOW()),
('supervisor', 'Charlie', 'E', 'Davis', 'password123', 'charlie.davis@example.com', FALSE, NOW()),
('chief', 'David', 'F', 'Miller', 'password123', 'david.miller@example.com', FALSE, NOW()),
('user', 'Eva', 'G', 'Wilson', 'password123', 'eva.wilson@example.com', TRUE, NOW()),
('manager', 'Frank', 'H', 'Moore', 'password123', 'frank.moore@example.com', FALSE, NOW()),
('user', 'Grace', 'I', 'Taylor', 'password123', 'grace.taylor@example.com', TRUE, NOW()),
('supervisor', 'Henry', 'J', 'Anderson', 'password123', 'henry.anderson@example.com', FALSE, NOW()),
('chief', 'Ivy', 'K', 'Thomas', 'password123', 'ivy.thomas@example.com', FALSE, NOW()),
('user', 'Jack', 'L', 'Jackson', 'password123', 'jack.jackson@example.com', TRUE, NOW()),
('manager', 'Kate', 'M', 'White', 'password123', 'kate.white@example.com', FALSE, NOW()),
('user', 'Leo', 'N', 'Harris', 'password123', 'leo.harris@example.com', TRUE, NOW()),
('supervisor', 'Mia', 'O', 'Martin', 'password123', 'mia.martin@example.com', FALSE, NOW()),
('chief', 'Nina', 'P', 'Garcia', 'password123', 'nina.garcia@example.com', FALSE, NOW()),
('user', 'Oscar', 'Q', 'Martinez', 'password123', 'oscar.martinez@example.com', TRUE, NOW()),
('manager', 'Pam', 'R', 'Robinson', 'password123', 'pam.robinson@example.com', FALSE, NOW()),
('user', 'Quinn', 'S', 'Clark', 'password123', 'quinn.clark@example.com', TRUE, NOW()),
('supervisor', 'Rita', 'T', 'Rodriguez', 'password123', 'rita.rodriguez@example.com', FALSE, NOW());


COMMIT;

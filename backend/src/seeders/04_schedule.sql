SET AUTOCOMMIT = 0;
START TRANSACTION;

INSERT INTO schedules (start_date, end_date, published, rating, notes, created_at) VALUES
('2024-06-01', '2024-06-07', TRUE, 5, 'June Week 1 Schedule', NOW()),
('2024-06-08', '2024-06-14', TRUE, 4, 'June Week 2 Schedule', NOW());


COMMIT;

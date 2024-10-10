SET AUTOCOMMIT = 0;
START TRANSACTION;

INSERT INTO events (event_participants, start_time, end_time, location_id, created_at) VALUES
(10, '2024-06-05 10:00:00', '2024-06-05 12:00:00', 1, NOW()),
(15, '2024-06-12 14:00:00', '2024-06-12 16:00:00', 2, NOW());
COMMIT;
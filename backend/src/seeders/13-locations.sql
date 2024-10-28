SET AUTOCOMMIT = 0;
START TRANSACTION;

INSERT INTO locations (name, event_id, longitude, latitude) VALUES
('Conference Room 1', 1, 40.712776, -74.005974),
('Conference Room 2', 2, 34.052235, -118.243683);

COMMIT;
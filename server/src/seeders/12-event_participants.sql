SET AUTOCOMMIT = 0;
START TRANSACTION;

INSERT INTO event_participants (user_id, event_id, created_at) VALUES
(1, 1, NOW()), (2, 1, NOW()), (3, 1, NOW()), (4, 1, NOW()), (5, 1, NOW()),
(6, 2, NOW()), (7, 2, NOW()), (8, 2, NOW()), (9, 2, NOW()), (10, 2, NOW());

COMMIT;
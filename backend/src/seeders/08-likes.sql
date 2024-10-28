SET AUTOCOMMIT = 0;
START TRANSACTION;

-- Schedule Likes
INSERT INTO schedule_likes (user_id, schedule_id, created_at) VALUES
(1, 1, NOW()), (2, 1, NOW()), (3, 1, NOW()), (4, 1, NOW()),
(5, 2, NOW()), (6, 2, NOW()), (7, 2, NOW()), (8, 2, NOW());

-- Shift Likes
INSERT INTO shift_likes (user_id, shift_id, created_at) VALUES
(1, 1, NOW()), (2, 2, NOW()), (3, 3, NOW()), (4, 4, NOW()),
(5, 5, NOW()), (6, 6, NOW()), (7, 22, NOW()), (8, 23, NOW()), (9, 24, NOW());

COMMIT;
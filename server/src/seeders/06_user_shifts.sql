SET AUTOCOMMIT = 0;
START TRANSACTION;
-- Assigning users to shifts in Schedule 1
INSERT INTO user_shifts (user_id, shift_id, created_at) VALUES
(1, 1, NOW()), (2, 1, NOW()), (3, 1, NOW()), (4, 1, NOW()), (5, 1, NOW()),
(6, 2, NOW()), (7, 2, NOW()), (8, 2, NOW()), (9, 2, NOW()),
(10, 3, NOW()), (11, 3, NOW()), (12, 3, NOW()),
-- Repeat for all shifts in Schedule 1
(1, 4, NOW()), (2, 4, NOW()), (3, 4, NOW()), (4, 4, NOW()),
(5, 5, NOW()), (6, 5, NOW()), (7, 5, NOW()),
(8, 6, NOW()), (9, 6, NOW()), (10, 6, NOW()), (11, 6, NOW()), (12, 6, NOW()),
-- Assigning users to shifts in Schedule 2
(13, 22, NOW()), (14, 22, NOW()), (15, 22, NOW()), (16, 22, NOW()),
(17, 23, NOW()), (18, 23, NOW()), (19, 23, NOW()),
(20, 24, NOW()), (1, 24, NOW()), (2, 24, NOW()),
-- Repeat for all shifts in Schedule 2
(3, 25, NOW()), (4, 25, NOW()), (5, 25, NOW()), (6, 25, NOW()),
(7, 26, NOW()), (8, 26, NOW()), (9, 26, NOW()),
(10, 27, NOW()), (11, 27, NOW()), (12, 27, NOW()), (13, 27, NOW()), (14, 27, NOW());


COMMIT;

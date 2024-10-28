SET AUTOCOMMIT = 0;
START TRANSACTION;

INSERT INTO vacations (user_id, start_date, end_date, created_at) VALUES
(1, '2024-06-10', '2024-06-14', NOW()), 
(2, '2024-06-15', '2024-06-20', NOW());


COMMIT;

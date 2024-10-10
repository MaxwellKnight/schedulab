SET AUTOCOMMIT = 0;
START TRANSACTION;

INSERT INTO preferences (user_id, start_date, end_date, notes, created_at) VALUES
(1, '2024-06-01', '2024-06-30', 'Prefers morning shifts', '2024-06-01'),
(2, '2024-06-15', '2024-07-15', 'Prefers evening shifts', '2024-06-01'),
(3, '2024-07-01', '2024-07-31', 'Flexible with shifts', '2024-06-01'),
(4, '2024-06-10', '2024-06-20', 'Prefers afternoon shifts', '2024-06-01'),
(5, '2024-07-05', '2024-07-25', 'Prefers morning shifts', '2024-06-01'),
(6, '2024-07-10', '2024-07-20', 'Prefers evening shifts', '2024-06-01'),
(7, '2024-06-20', '2024-07-10', 'Prefers afternoon shifts', '2024-06-01'),
(8, '2024-06-01', '2024-06-30', 'Flexible with shifts', '2024-06-01'),
(9, '2024-07-01', '2024-07-15', 'Prefers morning shifts', '2024-06-01'),
(10, '2024-06-15', '2024-06-25', 'Prefers evening shifts', '2024-06-01'),
(11, '2024-07-05', '2024-07-20', 'Prefers afternoon shifts', '2024-06-01'),
(12, '2024-06-10', '2024-06-30', 'Flexible with shifts', '2024-06-01'),
(13, '2024-07-10', '2024-07-25', 'Prefers morning shifts', '2024-06-01'),
(14, '2024-06-20', '2024-07-05', 'Prefers evening shifts', '2024-06-01'),
(15, '2024-07-01', '2024-07-20', 'Prefers afternoon shifts', '2024-06-01'),
(16, '2024-06-01', '2024-06-15', 'Flexible with shifts', '2024-06-01'),
(17, '2024-06-15', '2024-07-05', 'Prefers morning shifts', '2024-06-01'),
(18, '2024-07-05', '2024-07-25', 'Prefers evening shifts', '2024-06-01'),
(19, '2024-07-10', '2024-07-30', 'Prefers afternoon shifts', '2024-06-01'),
(20, '2024-06-10', '2024-06-20', 'Flexible with shifts', '2024-06-01');

COMMIT;

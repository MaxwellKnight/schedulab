SET AUTOCOMMIT = 0;
START TRANSACTION;

INSERT INTO remarks (schedule_id, content, created_at) VALUES
(1, 'Great job on the first week!', NOW()),
(2, 'Second week schedule looks good.', NOW());

COMMIT;
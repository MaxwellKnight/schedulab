SET AUTOCOMMIT = 0;
START TRANSACTION;

INSERT INTO feedback (user_id, title, content, sentiment, created_at) VALUES
(1, 'Excellent Work', 'The schedule is very well organized.', 'positive', NOW()),
(2, 'Needs Improvement', 'The shift distribution could be better.', 'neutral', NOW());

COMMIT;
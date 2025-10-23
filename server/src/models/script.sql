-- create a database named "githubactionsjobmonitor"

CREATE DATABASE githubactionsjobmonitor;

-- switch to the newly created database



-- get all tables in the current database

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
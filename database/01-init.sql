DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles WHERE rolname = 'testuser'
   ) THEN
      CREATE USER testuser WITH PASSWORD 'my_password';
   END IF;
END
$do$;
DO
$$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_roles WHERE rolname='bootcamp_role'
  ) THEN
    CREATE ROLE bootcamp_role WITH SUPERUSER CREATEDB CREATEROLE LOGIN ENCRYPTED PASSWORD 'senha_super_hiper_ultra_secreta_do_role_do_bootcamp';
  END IF;
END
$$;
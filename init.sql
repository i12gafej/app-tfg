USE sustainability_db;

INSERT INTO users (email, password, admin, name, surname, reset_token_state)
SELECT 'i12gafej@uco.es',
       '$2b$12$hNxsfDKOVPEl16S6dr2DieSYij6Voiv7kPP1uHM9Z9EQEFx8NXRFu',
       1,
       'javier',
       'garcia fernandez',
       0
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'i12gafej@uco.es'
);
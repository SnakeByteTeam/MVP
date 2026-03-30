CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE
);

INSERT INTO role (name) VALUES 
('Operatore sanitario'),
('Amministratore');

CREATE TABLE ward (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE 
);

INSERT INTO ward (name) VALUES ('test-ward');

CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    surname VARCHAR(255),
    name VARCHAR(255),
    password VARCHAR(255),
    first_access BOOLEAN DEFAULT TRUE,
    roleId INTEGER,
    FOREIGN KEY (roleId) REFERENCES role(id)
);

INSERT INTO "user" (username, surname, name, password, first_access, roleId)
VALUES ('test', 'test', 'test', 'test', FALSE, 1);
INSERT INTO "user" (username, surname, name, password, first_access, roleId)
VALUES ('admin', 'admin', 'admin', 'admin', FALSE, 2);



CREATE TABLE plant (
    id VARCHAR(255) PRIMARY KEY,
    ward_id INTEGER REFERENCES ward(id) ON DELETE SET NULL,
    name VARCHAR(255) UNIQUE
);


CREATE TABLE ward_user (
    id SERIAL PRIMARY KEY,
    ward_id INTEGER REFERENCES ward(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE
);


-- Fake data for ward-management UI preview.
INSERT INTO ward (name)
VALUES
        ('Reparto autosufficienti'),
        ('Reparto cure livello 1'),
        ('Reparto cure livello 2'),
        ('Reparto riabilitazione')
ON CONFLICT (name) DO NOTHING;

INSERT INTO "user" (username, surname, name, password, temp_password, roleId)
VALUES
        ('mrossi', 'Rossi', 'Mario', 'test', 'test', 1),
        ('gbianchi', 'Bianchi', 'Gioia', 'test', 'test', 1),
        ('lverdi', 'Verdi', 'Luca', 'test', 'test', 1),
        ('asala', 'Sala', 'Anna', 'test', 'test', 1),
        ('fneri', 'Neri', 'Franco', 'test', 'test', 1),
        -- Nuovi operatori sanitari
        ('gcolombo', 'Colombo', 'Giuseppe', 'test', 'test', 1),
        ('fferrari', 'Ferrari', 'Francesca', 'test', 'test', 1),
        ('arusso', 'Russo', 'Antonio', 'test', 'test', 1),
        ('cgallo', 'Gallo', 'Chiara', 'test', 'test', 1),
        ('mromano', 'Romano', 'Matteo', 'test', 'test', 1),
        -- Amministratori di sistema
        ('admin_mario', 'Draghi', 'Mario', 'test', 'test', 2),
        ('admin_luigi', 'Einaudi', 'Luigi', 'test', 'test', 2)
ON CONFLICT (username) DO NOTHING;



INSERT INTO ward_user (ward_id, user_id)
SELECT w.id, u.id
FROM ward w
JOIN "user" u ON u.username = 'mrossi'
WHERE w.name = 'Reparto autosufficienti'
    AND NOT EXISTS (
            SELECT 1
            FROM ward_user wu
            WHERE wu.ward_id = w.id
                AND wu.user_id = u.id
    );

INSERT INTO ward_user (ward_id, user_id)
SELECT w.id, u.id
FROM ward w
JOIN "user" u ON u.username = 'gbianchi'
WHERE w.name = 'Reparto autosufficienti'
    AND NOT EXISTS (
            SELECT 1
            FROM ward_user wu
            WHERE wu.ward_id = w.id
                AND wu.user_id = u.id
    );

INSERT INTO ward_user (ward_id, user_id)
SELECT w.id, u.id
FROM ward w
JOIN "user" u ON u.username = 'lverdi'
WHERE w.name = 'Reparto cure livello 1'
    AND NOT EXISTS (
            SELECT 1
            FROM ward_user wu
            WHERE wu.ward_id = w.id
                AND wu.user_id = u.id
    );

INSERT INTO ward_user (ward_id, user_id)
SELECT w.id, u.id
FROM ward w
JOIN "user" u ON u.username = 'asala'
WHERE w.name = 'Reparto cure livello 2'
    AND NOT EXISTS (
            SELECT 1
            FROM ward_user wu
            WHERE wu.ward_id = w.id
                AND wu.user_id = u.id
    );

INSERT INTO ward_user (ward_id, user_id)
SELECT w.id, u.id
FROM ward w
JOIN "user" u ON u.username = 'fneri'
WHERE w.name = 'Reparto riabilitazione'
    AND NOT EXISTS (
            SELECT 1
            FROM ward_user wu
            WHERE wu.ward_id = w.id
                AND wu.user_id = u.id
    );



DROP TABLE IF EXISTS token_cache;
DROP TABLE IF EXISTS plant;

CREATE UNLOGGED TABLE token_cache (
    access_token TEXT NOT NULL, 
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,

    lock BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT single_row UNIQUE (LOCK),
    CONSTRAINT lock_always_true CHECK (LOCK = TRUE)
);

CREATE TABLE plant (
    cached_at TIMESTAMPTZ NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    data JSONB NOT NULL,
    ward_id INTEGER REFERENCES ward(id) ON DELETE SET NULL
);

INSERT INTO plant (cached_at, id, data, ward_id)
SELECT
    NOW() - (gs * INTERVAL '1 minute') AS cached_at,
    CONCAT('apt-', LPAD(gs::text, 3, '0')) AS id,
    jsonb_build_object(
        'name', CONCAT('App. ', LPAD(gs::text, 3, '0')),
        'rooms', jsonb_build_array(
            jsonb_build_object(
                'id', CONCAT('apt-', LPAD(gs::text, 3, '0'), '-r1'),
                'name', 'Ingresso',
                'devices', jsonb_build_array()
            ),
            jsonb_build_object(
                'id', CONCAT('apt-', LPAD(gs::text, 3, '0'), '-r2'),
                'name', 'Camera principale',
                'devices', jsonb_build_array()
            )
        )
    ) AS data,
    CASE
        WHEN gs BETWEEN 1 AND 10 THEN (SELECT id FROM ward WHERE name = 'Reparto autosufficienti')
        WHEN gs BETWEEN 11 AND 18 THEN (SELECT id FROM ward WHERE name = 'Reparto cure livello 1')
        WHEN gs BETWEEN 19 AND 24 THEN (SELECT id FROM ward WHERE name = 'Reparto cure livello 2')
        WHEN gs BETWEEN 25 AND 30 THEN (SELECT id FROM ward WHERE name = 'Reparto riabilitazione')
        ELSE NULL
    END AS ward_id
FROM generate_series(1, 80) AS gs
ON CONFLICT (id) DO UPDATE
SET
    cached_at = EXCLUDED.cached_at,
    data = EXCLUDED.data,
    ward_id = EXCLUDED.ward_id;

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
    username VARCHAR(255) UNIQUE NOT NULL,
    surname VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    temp_password VARCHAR(255) UNIQUE NOT NULL,
    first_access BOOLEAN DEFAULT TRUE,
    roleId INTEGER NOT NULL,
    FOREIGN KEY (roleId) REFERENCES role(id)
);

INSERT INTO "user" (username, surname, name, password, temp_password, first_access, roleId)
VALUES
    ('test', 'test', 'test', 'test', 'tmp_test', FALSE, 1),
    ('admin', 'admin', 'admin', 'admin', 'tmp_admin', FALSE, 2)
ON CONFLICT (username) DO NOTHING;



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


-- TO BE DELETED: fake data
CREATE TEMP TABLE ward_seed (
    code TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    start_idx INTEGER NOT NULL,
    end_idx INTEGER NOT NULL
);

INSERT INTO ward_seed (code, name, start_idx, end_idx)
VALUES
    ('AUTO', 'Reparto autosufficienti', 1, 10),
    ('L1', 'Reparto cure livello 1', 11, 18),
    ('L2', 'Reparto cure livello 2', 19, 24),
    ('RIAB', 'Reparto riabilitazione', 25, 30)
ON CONFLICT (code) DO NOTHING;

INSERT INTO ward (name)
SELECT ws.name
FROM ward_seed ws
ON CONFLICT (name) DO NOTHING;

INSERT INTO "user" (username, surname, name, password, temp_password, first_access, roleId)
VALUES
    ('mrossi', 'Rossi', 'Mario', 'test', 'tmp_mrossi', TRUE, 1),
    ('gbianchi', 'Bianchi', 'Gioia', 'test', 'tmp_gbianchi', TRUE, 1),
    ('lverdi', 'Verdi', 'Luca', 'test', 'tmp_lverdi', TRUE, 1),
    ('asala', 'Sala', 'Anna', 'test', 'tmp_asala', TRUE, 1),
    ('fneri', 'Neri', 'Franco', 'test', 'tmp_fneri', TRUE, 1),
        -- Nuovi operatori sanitari
    ('gcolombo', 'Colombo', 'Giuseppe', 'test', 'tmp_gcolombo', TRUE, 1),
    ('fferrari', 'Ferrari', 'Francesca', 'test', 'tmp_fferrari', TRUE, 1),
    ('arusso', 'Russo', 'Antonio', 'test', 'tmp_arusso', TRUE, 1),
    ('cgallo', 'Gallo', 'Chiara', 'test', 'tmp_cgallo', TRUE, 1),
    ('mromano', 'Romano', 'Matteo', 'test', 'tmp_mromano', TRUE, 1),
        -- Amministratori di sistema
    ('admin_mario', 'Draghi', 'Mario', 'test', 'tmp_admin_mario', TRUE, 2),
    ('admin_luigi', 'Einaudi', 'Luigi', 'test', 'tmp_admin_luigi', TRUE, 2)
ON CONFLICT (username) DO NOTHING;

INSERT INTO ward_user (ward_id, user_id)
SELECT w.id, u.id
FROM (
    VALUES
    ('mrossi', 'AUTO'),
    ('gbianchi', 'AUTO'),
    ('lverdi', 'L1'),
    ('asala', 'L2'),
    ('fneri', 'RIAB')
) AS assignment(username, ward_code)
JOIN ward_seed ws ON ws.code = assignment.ward_code
JOIN ward w ON w.name = ws.name
JOIN "user" u ON u.username = assignment.username
LEFT JOIN ward_user wu ON wu.ward_id = w.id AND wu.user_id = u.id
WHERE wu.id IS NULL;



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
    wr.ward_id
FROM generate_series(1, 80) AS gs
LEFT JOIN (
    SELECT w.id AS ward_id, ws.start_idx, ws.end_idx
    FROM ward_seed ws
    JOIN ward w ON w.name = ws.name
) AS wr ON gs BETWEEN wr.start_idx AND wr.end_idx
ON CONFLICT (id) DO UPDATE
SET
    cached_at = EXCLUDED.cached_at,
    data = EXCLUDED.data,
    ward_id = EXCLUDED.ward_id;

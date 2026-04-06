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

INSERT INTO ward (name) VALUES
    ('test-ward'),
    ('Reparto autosufficienti'),
    ('Reparto cure livello 1'),
    ('Reparto cure livello 2'),
    ('Reparto riabilitazione');

CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    surname VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    temp_password VARCHAR(255) UNIQUE NOT NULL,
    first_access BOOLEAN DEFAULT TRUE,
    roleId INTEGER NOT NULL,
    FOREIGN KEY (roleId) REFERENCES role(id)
);

INSERT INTO "user" (username, surname, name, password, temp_password, first_access, roleId) VALUES
    ('test',        'test',     'test',      'test', 'tmp_test',        FALSE, 1),
    ('admin',       'admin',    'admin',     'admin','tmp_admin',        FALSE, 2),
    ('mrossi',      'Rossi',    'Mario',     'test', 'tmp_mrossi',       TRUE,  1),
    ('gbianchi',    'Bianchi',  'Gioia',     'test', 'tmp_gbianchi',     TRUE,  1),
    ('lverdi',      'Verdi',    'Luca',      'test', 'tmp_lverdi',       TRUE,  1),
    ('asala',       'Sala',     'Anna',      'test', 'tmp_asala',        TRUE,  1),
    ('fneri',       'Neri',     'Franco',    'test', 'tmp_fneri',        TRUE,  1),
    ('gcolombo',    'Colombo',  'Giuseppe',  'test', 'tmp_gcolombo',     TRUE,  1),
    ('fferrari',    'Ferrari',  'Francesca', 'test', 'tmp_fferrari',     TRUE,  1),
    ('arusso',      'Russo',    'Antonio',   'test', 'tmp_arusso',       TRUE,  1),
    ('cgallo',      'Gallo',    'Chiara',    'test', 'tmp_cgallo',       TRUE,  1),
    ('mromano',     'Romano',   'Matteo',    'test', 'tmp_mromano',      TRUE,  1),
    ('admin_mario', 'Draghi',   'Mario',     'test', 'tmp_admin_mario',  TRUE,  2),
    ('admin_luigi', 'Einaudi',  'Luigi',     'test', 'tmp_admin_luigi',  TRUE,  2)
ON CONFLICT (username) DO NOTHING;

CREATE TABLE ward_user (
    id SERIAL PRIMARY KEY,
    ward_id INTEGER REFERENCES ward(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE
);

INSERT INTO ward_user (ward_id, user_id)
SELECT w.id, u.id FROM (VALUES
    ('mrossi',   'Reparto autosufficienti'),
    ('gbianchi', 'Reparto autosufficienti'),
    ('lverdi',   'Reparto cure livello 1'),
    ('asala',    'Reparto cure livello 2'),
    ('fneri',    'Reparto riabilitazione')
) AS a(username, ward_name)
JOIN ward w ON w.name = a.ward_name
JOIN "user" u ON u.username = a.username;

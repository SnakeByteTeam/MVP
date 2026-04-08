CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS alarm_event;
DROP TABLE IF EXISTS alarm_rule;
DROP TABLE IF EXISTS plant;
DROP TABLE IF EXISTS token_cache;
DROP TABLE IF EXISTS oauth_ticket_cache;
DROP TABLE IF EXISTS datapoint_history;
DROP TABLE IF EXISTS ward_user;
DROP TABLE IF EXISTS "user";
DROP TABLE IF EXISTS ward;
DROP TABLE IF EXISTS role;


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
    first_access BOOLEAN DEFAULT TRUE,
    roleId INTEGER NOT NULL,
    FOREIGN KEY (roleId) REFERENCES role(id)
);

INSERT INTO "user" (username, surname, name, password, first_access, roleId) VALUES
    ('test',        'test',     'test',      'ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e473f8819a5d4940e0db27ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff', FALSE, 1),
    ('admin',       'admin',    'admin',     'c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec',  FALSE, 2),
    ('mrossi',      'Rossi',    'Mario',     'test',  TRUE,  1),
    ('gbianchi',    'Bianchi',  'Gioia',     'test',  TRUE,  1),
    ('lverdi',      'Verdi',    'Luca',      'test',  TRUE,  1),
    ('asala',       'Sala',     'Anna',      'test',  TRUE,  1),
    ('fneri',       'Neri',     'Franco',    'test',  TRUE,  1),
    ('gcolombo',    'Colombo',  'Giuseppe',  'test',  TRUE,  1),
    ('fferrari',    'Ferrari',  'Francesca', 'test',  TRUE,  1),
    ('arusso',      'Russo',    'Antonio',   'test',  TRUE,  1),
    ('cgallo',      'Gallo',    'Chiara',    'test',  TRUE,  1),
    ('mromano',     'Romano',   'Matteo',    'test',  TRUE,  1),
    ('admin_mario', 'Draghi',   'Mario',     'test',  TRUE,  2),
    ('admin_luigi', 'Einaudi',  'Luigi',     'test',  TRUE,  2)
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

CREATE UNLOGGED TABLE token_cache (
    access_token  TEXT        NOT NULL,
    refresh_token TEXT        NOT NULL,
    expires_at    TIMESTAMPTZ NOT NULL,
    user_id       INTEGER     NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    email         VARCHAR(255) NOT NULL,
    lock          BOOLEAN     NOT NULL DEFAULT TRUE,
    CONSTRAINT single_row    UNIQUE (lock),
    CONSTRAINT lock_always_true CHECK (lock = TRUE)
);

CREATE UNLOGGED TABLE oauth_ticket_cache (
    ticket     UUID        PRIMARY KEY,
    user_id    INTEGER     NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_oauth_ticket_cache_expires_at
    ON oauth_ticket_cache (expires_at);

CREATE TABLE datapoint_history (
    timestamp    TIMESTAMPTZ NOT NULL,
    datapoint_id TEXT        NOT NULL,
    value        TEXT        NOT NULL,
    PRIMARY KEY (timestamp, datapoint_id)
);

SELECT create_hypertable('datapoint_history', 'timestamp');

CREATE INDEX idx_datapoint_history_datapoint_id
    ON datapoint_history (datapoint_id, timestamp DESC);

ALTER TABLE datapoint_history SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'datapoint_id'
);

CREATE TABLE plant (
    cached_at TIMESTAMPTZ  NOT NULL,
    id        VARCHAR(36)  PRIMARY KEY,
    data      JSONB        NOT NULL,
    ward_id   INTEGER      REFERENCES ward(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS alarm_rule (
    id                 VARCHAR(255) PRIMARY KEY,
    name               VARCHAR(255) NOT NULL,
    threshold_operator CHAR(2)      NOT NULL,
    threshold_value    VARCHAR(20)  NOT NULL,
    priority           INTEGER      NOT NULL,
    arming_time        TIME,
    dearming_time      TIME,
    is_armed           BOOLEAN      NOT NULL DEFAULT TRUE,
    device_id          VARCHAR(255) NOT NULL,
    datapoint_id       VARCHAR(255) NOT NULL,
    plant_id           VARCHAR(64)  NOT NULL REFERENCES plant(id),
    created_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    is_changed_when_used BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS alarm_event (
    id VARCHAR(255) PRIMARY KEY,
    alarm_rule_id VARCHAR(255),
    activation_time TIMESTAMPTZ NOT NULL,
    resolution_time TIMESTAMPTZ,
    user_id INTEGER,
    FOREIGN KEY (alarm_rule_id)
        REFERENCES alarm_rule(id)
        ON DELETE SET NULL,
    FOREIGN KEY (user_id)
        REFERENCES "user"(id)
);


CREATE TABLE IF NOT EXISTS notification (
    id SERIAL PRIMARY KEY, 
    ward_id INTEGER REFERENCES ward(id) ON DELETE CASCADE,
    alarm_event_id VARCHAR(255) REFERENCES alarm_event(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL
);


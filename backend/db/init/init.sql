CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS alarm_event;
DROP TABLE IF EXISTS alarm_rule;
DROP TABLE IF EXISTS status;
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


CREATE TABLE IF NOT EXISTS status (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

INSERT INTO status (name) VALUES
('Attivo'),
('Risolto'),
('In gestione');

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
    plant_id           VARCHAR(64)  NOT NULL REFERENCES plant(id),
    created_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    is_changed_when_used BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO alarm_rule (id, name, threshold_operator, threshold_value, priority, arming_time, dearming_time, is_armed, device_id, plant_id) VALUES
('rule-001', 'Temperatura critica',    '>',  '30',    1, '00:00', '23:59', TRUE, 'fct-AA0011BB0011-1000000001', 'AA0011BB0011'),
('rule-002', 'Luce accesa di notte',   '=',  'on',    3, '22:00', '06:00', TRUE, 'fct-AA0011BB0011-1000000001',        'AA0011BB0011'),
('rule-003', 'Caduta rilevata',        '=',  'on',    1, '00:00', '23:59', TRUE, 'fct-AA0011BB0011-1000000001',      'AA0011BB0011'),
('rule-004', 'Temperatura alta',       '>',  '25',    2, '00:00', '23:59', TRUE, 'fct-BB0022CC0022-2000000002',  'BB0022CC0022'),
('rule-005', 'Caduta rilevata',        '=',  'on',    1, '00:00', '23:59', TRUE, 'fct-BB0022CC0022-2000000002',      'BB0022CC0022');

-- Regole aggiuntive per test UI/paginazione/stati su allarmi attivi.
INSERT INTO alarm_rule (id, name, threshold_operator, threshold_value, priority, arming_time, dearming_time, is_armed, device_id, plant_id) VALUES
('rule-006', 'Temp soggiorno warning',      '>',  '28',   3, '00:00', '23:59', TRUE, 'fct-AA0011BB0011-1000000001', 'AA0011BB0011'),
('rule-007', 'Temp soggiorno critica',      '>=', '31',   4, '00:00', '23:59', TRUE, 'fct-AA0011BB0011-1000000001', 'AA0011BB0011'),
('rule-008', 'Luce soggiorno sempre accesa','=',  'on',   2, '00:00', '23:59', TRUE, 'fct-AA0011BB0011-1000000001',        'AA0011BB0011'),
('rule-009', 'Caduta bagno test-ward',      '=',  'on',   4, '00:00', '23:59', TRUE, 'fct-AA0011BB0011-1000000001',      'AA0011BB0011'),
('rule-010', 'Temp ingresso alta',          '>',  '21',   3, '00:00', '23:59', TRUE, 'fct-BB0022CC0022-2000000002',  'BB0022CC0022'),
('rule-orphan-temp', 'Regola da eliminare', '>',  '29',   1, '00:00', '23:59', TRUE, 'fct-AA0011BB0011-1000000001', 'AA0011BB0011');


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
--seed piccolo per provare alarm_event
INSERT INTO alarm_event (id, alarm_rule_id, activation_time, user_id) VALUES
('event-001', 'rule-001', '2023-10-01 10:00:00+00', 1),
('event-002', 'rule-002', '2023-10-01 22:30:00+00', 1),
('event-003', 'rule-003', '2023-10-02 14:15:00+00', 1),
('event-004', 'rule-004', '2023-10-03 09:45:00+00', 1),
('event-005', 'rule-005', '2023-10-04 18:20:00+00', 1);



CREATE TABLE IF NOT EXISTS notification (
    id SERIAL PRIMARY KEY, 
    ward_id INTEGER REFERENCES ward(id) ON DELETE CASCADE,
    alarm_event_id VARCHAR(255) REFERENCES alarm_event(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL
);


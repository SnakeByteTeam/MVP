<<<<<<< HEAD
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

DROP TABLE IF EXISTS token_cache;
DROP TABLE IF EXISTS plant;
DROP TABLE IF EXISTS datapoint_history;
CREATE EXTENSION IF NOT EXISTS timescaledb;


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

CREATE UNLOGGED TABLE token_cache (
    access_token TEXT NOT NULL, 
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,

    lock BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT single_row UNIQUE (LOCK),
    CONSTRAINT lock_always_true CHECK (LOCK = TRUE)
);

CREATE TABLE datapoint_history (
    timestamp    TIMESTAMPTZ  NOT NULL,
    datapoint_id TEXT  NOT NULL,
    value        TEXT  NOT NULL,
    PRIMARY KEY (timestamp, datapoint_id)
);

SELECT create_hypertable('datapoint_history', 'timestamp');

CREATE INDEX idx_datapoint_history_datapoint_id
    ON datapoint_history (datapoint_id, timestamp DESC);

ALTER TABLE datapoint_history SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'datapoint_id'
);

INSERT INTO datapoint_history (timestamp, datapoint_id, value) VALUES
('2026-03-31 20:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'Off'),
('2026-03-31 08:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '0.5'),
('2026-03-31 20:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '20.0'),
('2026-03-31 08:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_HVACMode', 'Heating'),
('2026-03-31 20:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_HVACMode', 'Off'),
('2026-04-01 07:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
('2026-04-01 08:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-04-01 10:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-04-01 12:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
('2026-04-01 20:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-04-01 23:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
('2026-04-01 07:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '20.0'),
('2026-04-01 12:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '40000.5'),
('2026-04-01 20:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '21.0'),
('2026-04-01 23:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '20.5'),
('2026-04-01 07:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_HVACMode', 'Off'),
('2026-04-01 08:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_HVACMode', 'Heating'),
('2026-04-01 12:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_HVACMode', 'Off'),
('2026-04-01 08:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-04-01 10:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'Detected'),
('2026-04-01 10:45:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-04-01 20:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-04-01 09:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'NotDetected'),
('2026-04-01 10:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'Detected'),
('2026-04-01 10:35:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'Detected'),
('2026-04-01 11:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'NotDetected'),
('2026-04-01 07:30:00+00', 'dp-AA0011BB0011-1000000005-SFE_State_Fall', 'NoFall'),
('2026-04-01 20:00:00+00', 'dp-AA0011BB0011-1000000005-SFE_State_Fall', 'NoFall'),
('2026-04-01 07:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'Off'),
('2026-04-01 08:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'On'),
('2026-04-01 20:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'Off'),
('2026-04-01 08:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '19.5'),
('2026-04-01 20:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '20.0'),
('2026-04-01 08:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_HVACMode', 'Heating'),
('2026-04-01 20:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_HVACMode', 'Off'),
('2026-03-27 11:00:00+00', 'dp-AA0011BB0011-1000000005-SFE_State_Fall', 'Fall'),
('2026-03-27 11:30:00+00', 'dp-AA0011BB0011-1000000005-SFE_State_Fall', 'NoFall'),
('2026-03-20 10:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '11.5'),
('2026-03-20 14:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '11.8'),
('2026-03-20 18:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '11.1'),
('2026-03-21 09:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '11.0'),
('2026-03-21 13:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '11.3'),
('2026-03-22 11:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '11.8'),
('2026-03-25 10:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '27.2'),
('2026-03-25 15:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '30.0'),
('2026-03-28 09:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '26.1'),
('2026-03-31 12:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '28.5'),
('2026-04-01 11:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '27.0'),
('2026-03-20 06:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-03-20 23:30:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
('2026-03-21 06:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-03-21 23:30:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
('2026-03-22 06:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-03-22 23:30:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
('2026-03-23 06:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-03-23 23:30:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
('2026-03-24 06:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-03-24 23:30:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
('2026-03-25 06:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-03-25 23:30:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
('2026-03-26 06:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-03-26 23:30:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
('2026-03-27 06:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-03-27 23:30:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
('2026-03-28 06:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-03-28 23:30:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
('2026-03-29 06:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-03-29 23:30:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
('2026-03-30 06:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-03-30 23:30:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
('2026-03-31 06:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-03-31 23:30:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
('2026-04-01 06:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-04-01 23:30:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off')
ON CONFLICT DO NOTHING;

CREATE TABLE plant (
    cached_at TIMESTAMPTZ NOT NULL,
    id VARCHAR(36) PRIMARY KEY,
    data JSONB NOT NULL,
    ward_id INTEGER REFERENCES ward(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS alarm_rule (
    id                  VARCHAR(255) PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    threshold_operator  CHAR(2)      NOT NULL,
    threshold_value     VARCHAR(20)  NOT NULL,
    priority            INTEGER      NOT NULL,
    arming_time         TIME,
    dearming_time       TIME,
    is_armed            BOOLEAN      NOT NULL DEFAULT TRUE,
    device_id           VARCHAR(255) NOT NULL,
    plant_id            VARCHAR(64)         NOT NULL REFERENCES plant(id),
    CONSTRAINT chk_armed_arming CHECK (
        NOT (is_armed = FALSE AND arming_time IS NOT NULL AND
             CURRENT_TIME BETWEEN arming_time AND dearming_time)
    )
);

CREATE TABLE IF NOT EXISTS status (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL
);

INSERT INTO status (name) VALUES
    ('Attivo'),
    ('Risolto'),
    ('In gestione');

CREATE TABLE IF NOT EXISTS alarm_event (
    id               SERIAL PRIMARY KEY,
    activation_time  TIMESTAMP    NOT NULL,
    resolution_time  TIMESTAMP,
    status           INTEGER      NOT NULL REFERENCES status(id),
    alarm_id         VARCHAR(255) NOT NULL REFERENCES alarm_rule(id),
    user_id          INTEGER      REFERENCES "user"(id),
    CONSTRAINT chk_resolved CHECK (
        (resolution_time IS NULL     AND user_id IS NULL     AND status = 1) OR
        (resolution_time IS NOT NULL AND user_id IS NOT NULL AND status = 2) OR
        (resolution_time IS NULL     AND user_id IS NOT NULL AND status = 3)
    )
);

=======
CREATE TABLE alarms (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    plant_id VARCHAR(255) NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    priority INT NOT NULL CHECK (priority IN (1, 2, 3, 4)),
    threshold DECIMAL(10, 2) NOT NULL,
    arming_time TIME NOT NULL,
    dearming_time TIME NOT NULL,
    enabled BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO alarms (id, name, plant_id, device_id, priority, threshold, arming_time, dearming_time, enabled)
VALUES
('ALM001', 'Temperatura alta', 'PLANT01', 'DEV001', 1, 75.50, '08:00:00', '18:00:00', TRUE),
('ALM002', 'Pressione bassa', 'PLANT01', 'DEV002', 2, 30.00, '00:00:00', '23:59:59', TRUE),
('ALM003', 'Livello serbatoio', 'PLANT02', 'DEV003', 3, 60.25, '06:00:00', '20:00:00', FALSE),
('ALM004', 'Vibrazione motore', 'PLANT02', 'DEV004', 1, 5.75, '07:30:00', '19:30:00', TRUE),
('ALM005', 'Umidità ambiente', 'PLANT03', 'DEV005', 4, 85.00, '09:00:00', '17:00:00', FALSE),
('ALM006', 'Corrente alta', 'PLANT01', 'DEV006', 2, 15.80, '00:00:00', '23:59:59', TRUE),
('ALM007', 'Gas rilevato', 'PLANT04', 'DEV007', 1, 10.00, '00:00:00', '23:59:59', TRUE),
('ALM008', 'Porta aperta', 'PLANT03', 'DEV008', 3, 1.00, '18:00:00', '06:00:00', TRUE);
>>>>>>> feature/alarms

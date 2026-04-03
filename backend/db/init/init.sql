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


-- Override apt-001 with full device/datapoint metadata for analytics
UPDATE plant SET data = jsonb_build_object(
    'name', 'App. 001',
    'rooms', jsonb_build_array(
        jsonb_build_object(
            'id', 'apt-001-r1', 'name', 'Camera principale',
            'devices', jsonb_build_array(
                jsonb_build_object(
                    'id', 'fct-AA0011BB0011-1000000001', 'type', 'SF_Light',
                    'datapoints', jsonb_build_array(
                        jsonb_build_object('id', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff',
                                           'name', 'Luce Camera', 'sfeType', 'SFE_State_OnOff')
                    )
                ),
                jsonb_build_object(
                    'id', 'fct-AA0011BB0011-1000000002', 'type', 'SF_Thermostat',
                    'datapoints', jsonb_build_array(
                        jsonb_build_object('id', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature',
                                           'name', 'Temperatura Camera', 'sfeType', 'SFE_State_Temperature'),
                        jsonb_build_object('id', 'dp-AA0011BB0011-1000000002-SFE_State_HVACMode',
                                           'name', 'Modalità HVAC', 'sfeType', 'SFE_State_HVACMode')
                    )
                )
            )
        ),
        jsonb_build_object(
            'id', 'apt-001-r2', 'name', 'Bagno',
            'devices', jsonb_build_array(
                jsonb_build_object(
                    'id', 'fct-AA0011BB0011-1000000003', 'type', 'SF_Access',
                    'datapoints', jsonb_build_array(
                        jsonb_build_object('id', 'dp-AA0011BB0011-1000000003-SFE_State_Presence',
                                           'name', 'Presenza Bagno', 'sfeType', 'SFE_State_Presence')
                    )
                ),
                jsonb_build_object(
                    'id', 'fct-AA0011BB0011-1000000004', 'type', 'SF_Access',
                    'datapoints', jsonb_build_array(
                        jsonb_build_object('id', 'dp-AA0011BB0011-1000000004-SFE_State_Presence',
                                           'name', 'Presenza Letto', 'sfeType', 'SFE_State_Presence')
                    )
                ),
                jsonb_build_object(
                    'id', 'fct-AA0011BB0011-1000000005', 'type', 'SF_FallDetector',
                    'datapoints', jsonb_build_array(
                        jsonb_build_object('id', 'dp-AA0011BB0011-1000000005-SFE_State_Fall',
                                           'name', 'Caduta Bagno', 'sfeType', 'SFE_State_Fall')
                    )
                )
            )
        )
    )
) WHERE id = 'apt-001';

-- Override apt-002 with full device/datapoint metadata for analytics
UPDATE plant SET data = jsonb_build_object(
    'name', 'App. 002',
    'rooms', jsonb_build_array(
        jsonb_build_object(
            'id', 'apt-002-r1', 'name', 'Camera principale',
            'devices', jsonb_build_array(
                jsonb_build_object(
                    'id', 'fct-BB0022CC0022-2000000001', 'type', 'SF_Light',
                    'datapoints', jsonb_build_array(
                        jsonb_build_object('id', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff',
                                           'name', 'Luce Camera', 'sfeType', 'SFE_State_OnOff')
                    )
                ),
                jsonb_build_object(
                    'id', 'fct-BB0022CC0022-2000000002', 'type', 'SF_Thermostat',
                    'datapoints', jsonb_build_array(
                        jsonb_build_object('id', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature',
                                           'name', 'Temperatura Camera', 'sfeType', 'SFE_State_Temperature'),
                        jsonb_build_object('id', 'dp-BB0022CC0022-2000000002-SFE_State_HVACMode',
                                           'name', 'Modalità HVAC', 'sfeType', 'SFE_State_HVACMode')
                    )
                )
            )
        )
    )
) WHERE id = 'apt-002';

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

INSERT INTO alarm_rule (id, name, threshold_operator, threshold_value, priority, arming_time, dearming_time, is_armed, device_id, plant_id) VALUES
    ('alarm-rule-001', 'Caduta Bagno Rossi',        '= ', 'Fall', 1, '00:00', '23:59', TRUE, 'fct-AA0011BB0011-1000000005', 'apt-001'),
    ('alarm-rule-002', 'Presenza Prolungata Bagno', '>=', '30',   2, '06:00', '22:00', TRUE, 'fct-AA0011BB0011-1000000004', 'apt-001'),
    ('alarm-rule-003', 'Temperatura Alta Camera',   '> ', '25',   3, NULL,    NULL,    TRUE, 'fct-AA0011BB0011-1000000002', 'apt-001'),
    ('alarm-rule-004', 'Caduta Bagno Bianchi',      '= ', 'Fall', 1, '00:00', '23:59', TRUE, 'fct-BB0022CC0022-2000000003', 'apt-002');

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

INSERT INTO alarm_event (activation_time, resolution_time, status, alarm_id, user_id) VALUES
('2026-03-17 10:15:00', '2026-03-17 10:45:00', 2, 'alarm-rule-001', 2),
('2026-03-17 14:00:00', NULL,                  1, 'alarm-rule-002', NULL),
('2026-03-18 09:30:00', '2026-03-18 10:00:00', 2, 'alarm-rule-001', 2),
('2026-03-18 11:05:00', '2026-03-18 11:30:00', 2, 'alarm-rule-003', 3),
('2026-03-18 15:00:00', NULL,                  3, 'alarm-rule-002', 2),
('2026-03-19 08:45:00', '2026-03-19 09:15:00', 2, 'alarm-rule-004', 2),
('2026-03-19 13:00:00', NULL,                  1, 'alarm-rule-001', NULL),
('2026-03-20 10:00:00', '2026-03-20 11:30:00', 2, 'alarm-rule-003', 2),
('2026-03-21 13:00:00', NULL,                  3, 'alarm-rule-003', 3),
('2026-03-25 15:00:00', '2026-03-25 16:00:00', 2, 'alarm-rule-003', 2),
('2026-03-31 12:00:00', NULL,                  1, 'alarm-rule-003', NULL);
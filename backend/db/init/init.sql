CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

DROP TABLE IF EXISTS alarm_event;
DROP TABLE IF EXISTS alarm_rule;
DROP TABLE IF EXISTS status;
DROP TABLE IF EXISTS plant;
DROP TABLE IF EXISTS token_cache;
DROP TABLE IF EXISTS datapoint_history;
DROP TABLE IF EXISTS ward_user;
DROP TABLE IF EXISTS "user";
DROP TABLE IF EXISTS ward;
DROP TABLE IF EXISTS role;

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
    password VARCHAR(255) NOT NULL,
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
    lock          BOOLEAN     NOT NULL DEFAULT TRUE,
    CONSTRAINT single_row    UNIQUE (lock),
    CONSTRAINT lock_always_true CHECK (lock = TRUE)
);

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

INSERT INTO plant (cached_at, id, data, ward_id) VALUES (
  NOW(),
  'AA0011BB0011',
  '{
    "id": "AA0011BB0011",
    "name": "Appartamento Rossi",
    "rooms": [
      {
        "id": "loc-AA0011BB0011-1",
        "name": "Soggiorno",
        "devices": [
          {
            "id": "fct-AA0011BB0011-1000000001",
            "plantId": "AA0011BB0011",
            "name": "Luce Soggiorno",
            "type": "SS_Light_Switch",
            "subType": "SF_Light",
            "datapoints": [
              {
                "id": "dp-AA0011BB0011-1000000001-SFE_Cmd_OnOff",
                "name": "SFE_Cmd_OnOff",
                "readable": false, "writable": true,
                "valueType": "string", "enum": ["Off","On"],
                "sfeType": "SFE_Cmd_OnOff"
              },
              {
                "id": "dp-AA0011BB0011-1000000001-SFE_State_OnOff",
                "name": "SFE_State_OnOff",
                "readable": true, "writable": false,
                "valueType": "string", "enum": ["Off","On"],
                "sfeType": "SFE_State_OnOff"
              }
            ]
          },
          {
            "id": "fct-AA0011BB0011-1000000002",
            "plantId": "AA0011BB0011",
            "name": "Termostato Soggiorno",
            "type": "SS_Clima_Zone",
            "subType": "SF_Clima",
            "datapoints": [
              {
                "id": "dp-AA0011BB0011-1000000002-SFE_State_Temperature",
                "name": "SFE_State_Temperature",
                "readable": true, "writable": false,
                "valueType": "string", "enum": [],
                "sfeType": "SFE_State_Temperature"
              },
              {
                "id": "dp-AA0011BB0011-1000000002-SFE_State_HVACMode",
                "name": "SFE_State_HVACMode",
                "readable": true, "writable": false,
                "valueType": "string", "enum": ["Heating","Cooling","Off"],
                "sfeType": "SFE_State_HVACMode"
              }
            ]
          }
        ]
      },
      {
        "id": "loc-AA0011BB0011-2",
        "name": "Camera da letto",
        "devices": [
          {
            "id": "fct-AA0011BB0011-1000000003",
            "plantId": "AA0011BB0011",
            "name": "Sensore Presenza 1",
            "type": "SS_Access_RadarDetector",
            "subType": "SF_Access",
            "datapoints": [
              {
                "id": "dp-AA0011BB0011-1000000003-SFE_State_Presence",
                "name": "SFE_State_Presence",
                "readable": true, "writable": false,
                "valueType": "string", "enum": ["Detected","NotDetected"],
                "sfeType": "SFE_State_Presence"
              }
            ]
          },
          {
            "id": "fct-AA0011BB0011-1000000004",
            "plantId": "AA0011BB0011",
            "name": "Sensore Presenza 2",
            "type": "SS_Access_RadarDetector",
            "subType": "SF_Access",
            "datapoints": [
              {
                "id": "dp-AA0011BB0011-1000000004-SFE_State_Presence",
                "name": "SFE_State_Presence",
                "readable": true, "writable": false,
                "valueType": "string", "enum": ["Detected","NotDetected"],
                "sfeType": "SFE_State_Presence"
              }
            ]
          }
        ]
      },
      {
        "id": "loc-AA0011BB0011-3",
        "name": "Bagno",
        "devices": [
          {
            "id": "fct-AA0011BB0011-1000000005",
            "plantId": "AA0011BB0011",
            "name": "Sensore Caduta",
            "type": "SS_Safety_ManDown",
            "subType": "SF_Safety",
            "datapoints": [
              {
                "id": "dp-AA0011BB0011-1000000005-SFE_State_ManDown",
                "name": "SFE_State_ManDown",
                "readable": true, "writable": false,
                "valueType": "string", "enum": ["True","False"],
                "sfeType": "SFE_State_ManDown"
              }
            ]
          }
        ]
      }
    ],
    "wardId": null
  }',
  (SELECT id FROM ward WHERE name = 'test-ward')
);

INSERT INTO plant (cached_at, id, data, ward_id) VALUES (
  NOW(),
  'BB0022CC0022',
  '{
    "id": "BB0022CC0022",
    "name": "Appartamento Bianchi",
    "rooms": [
      {
        "id": "loc-BB0022CC0022-1",
        "name": "Ingresso",
        "devices": [
          {
            "id": "fct-BB0022CC0022-2000000001",
            "plantId": "BB0022CC0022",
            "name": "Luce Ingresso",
            "type": "SS_Light_Switch",
            "subType": "SF_Light",
            "datapoints": [
              {
                "id": "dp-BB0022CC0022-2000000001-SFE_Cmd_OnOff",
                "name": "SFE_Cmd_OnOff",
                "readable": false, "writable": true,
                "valueType": "string", "enum": ["Off","On"],
                "sfeType": "SFE_Cmd_OnOff"
              },
              {
                "id": "dp-BB0022CC0022-2000000001-SFE_State_OnOff",
                "name": "SFE_State_OnOff",
                "readable": true, "writable": false,
                "valueType": "string", "enum": ["Off","On"],
                "sfeType": "SFE_State_OnOff"
              }
            ]
          },
          {
            "id": "fct-BB0022CC0022-2000000002",
            "plantId": "BB0022CC0022",
            "name": "Termostato Ingresso",
            "type": "SS_Clima_Zone",
            "subType": "SF_Clima",
            "datapoints": [
              {
                "id": "dp-BB0022CC0022-2000000002-SFE_State_Temperature",
                "name": "SFE_State_Temperature",
                "readable": true, "writable": false,
                "valueType": "string", "enum": [],
                "sfeType": "SFE_State_Temperature"
              },
              {
                "id": "dp-BB0022CC0022-2000000002-SFE_State_HVACMode",
                "name": "SFE_State_HVACMode",
                "readable": true, "writable": false,
                "valueType": "string", "enum": ["Heating","Cooling","Off"],
                "sfeType": "SFE_State_HVACMode"
              }
            ]
          }
        ]
      },
      {
        "id": "loc-BB0022CC0022-2",
        "name": "Camera da letto",
        "devices": [
          {
            "id": "fct-BB0022CC0022-2000000003",
            "plantId": "BB0022CC0022",
            "name": "Sensore Presenza 1",
            "type": "SS_Access_RadarDetector",
            "subType": "SF_Access",
            "datapoints": [
              {
                "id": "dp-BB0022CC0022-2000000003-SFE_State_Presence",
                "name": "SFE_State_Presence",
                "readable": true, "writable": false,
                "valueType": "string", "enum": ["Detected","NotDetected"],
                "sfeType": "SFE_State_Presence"
              }
            ]
          },
          {
            "id": "fct-BB0022CC0022-2000000004",
            "plantId": "BB0022CC0022",
            "name": "Sensore Presenza 2",
            "type": "SS_Access_RadarDetector",
            "subType": "SF_Access",
            "datapoints": [
              {
                "id": "dp-BB0022CC0022-2000000004-SFE_State_Presence",
                "name": "SFE_State_Presence",
                "readable": true, "writable": false,
                "valueType": "string", "enum": ["Detected","NotDetected"],
                "sfeType": "SFE_State_Presence"
              }
            ]
          }
        ]
      },
      {
        "id": "loc-BB0022CC0022-3",
        "name": "Bagno",
        "devices": [
          {
            "id": "fct-BB0022CC0022-2000000005",
            "plantId": "BB0022CC0022",
            "name": "Sensore Caduta",
            "type": "SS_Safety_ManDown",
            "subType": "SF_Safety",
            "datapoints": [
              {
                "id": "dp-BB0022CC0022-2000000005-SFE_State_ManDown",
                "name": "SFE_State_ManDown",
                "readable": true, "writable": false,
                "valueType": "string", "enum": ["True","False"],
                "sfeType": "SFE_State_ManDown"
              }
            ]
          }
        ]
      }
    ],
    "wardId": null
  }',
  NULL
);

INSERT INTO datapoint_history (timestamp, datapoint_id, value) VALUES
-- giorno -10: 2026-03-24
('2026-03-24 03:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-03-24 23:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
-- giorno -9: 2026-03-25
('2026-03-25 03:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-03-25 23:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
-- giorno -8: 2026-03-26
('2026-03-26 03:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-03-26 23:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
-- giorno -7: 2026-03-27
('2026-03-27 03:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-03-27 23:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
-- giorno -6: 2026-03-28
('2026-03-28 03:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-03-28 23:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
-- giorno -5: 2026-03-29
('2026-03-29 03:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-03-29 23:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
-- giorno -4: 2026-03-30
('2026-03-30 03:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-03-30 23:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
-- giorno -3: 2026-03-31
('2026-03-31 03:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-03-31 23:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
-- giorno -2: 2026-04-01
('2026-04-01 03:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-04-01 23:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
-- giorno -1: 2026-04-02
('2026-04-02 03:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'On'),
('2026-04-02 23:00:00+00', 'dp-AA0011BB0011-1000000001-SFE_State_OnOff', 'Off'),
('2026-03-24 08:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '31.5'),
('2026-03-24 20:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '32.0'),
('2026-03-25 08:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '30.5'),
('2026-03-25 20:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '33.0'),
('2026-03-26 08:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '34.0'),
('2026-03-26 20:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '34.5'),
('2026-03-27 08:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '35.0'),
('2026-03-27 20:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '32.5'),
('2026-03-28 08:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '31.0'),
('2026-03-28 20:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '33.5'),
('2026-03-29 08:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '30.0'),
('2026-03-29 20:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '31.5'),
('2026-03-30 08:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '32.0'),
('2026-03-30 20:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '34.0'),
('2026-03-31 08:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '33.0'),
('2026-03-31 20:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '35.0'),
('2026-04-01 08:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '30.5'),
('2026-04-01 20:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '32.0'),
('2026-04-02 08:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '31.0'),
('2026-04-02 20:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', '33.5'),
('2026-03-24 08:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_HVACMode', 'Heating'),
('2026-03-24 20:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_HVACMode', 'Heating'),
('2026-03-27 08:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_HVACMode', 'Heating'),
('2026-03-31 08:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_HVACMode', 'Heating'),
('2026-04-01 08:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_HVACMode', 'Heating'),
('2026-04-02 08:00:00+00', 'dp-AA0011BB0011-1000000002-SFE_State_HVACMode', 'Heating'),
('2026-03-24 08:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-24 09:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'Detected'),
('2026-03-24 09:45:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'Detected'),
('2026-03-24 10:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-25 08:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-25 09:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'Detected'),
('2026-03-25 09:45:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'Detected'),
('2026-03-25 10:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-26 08:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-26 09:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'Detected'),
('2026-03-26 09:45:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'Detected'),
('2026-03-26 10:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-27 08:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-27 09:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'Detected'),
('2026-03-27 09:45:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'Detected'),
('2026-03-27 10:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-28 08:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-28 09:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'Detected'),
('2026-03-28 09:45:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'Detected'),
('2026-03-28 10:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-29 08:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-29 09:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'Detected'),
('2026-03-29 09:45:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'Detected'),
('2026-03-29 10:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-30 08:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-30 09:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'Detected'),
('2026-03-30 09:45:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'Detected'),
('2026-03-30 10:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-31 08:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-31 09:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'Detected'),
('2026-03-31 09:45:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'Detected'),
('2026-03-31 10:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-04-01 08:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-04-01 09:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'Detected'),
('2026-04-01 09:45:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'Detected'),
('2026-04-01 10:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-04-02 08:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-04-02 09:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'Detected'),
('2026-04-02 09:45:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'Detected'),
('2026-04-02 10:00:00+00', 'dp-AA0011BB0011-1000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-24 13:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-24 14:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'Detected'),
('2026-03-24 14:20:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-25 13:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-25 14:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'Detected'),
('2026-03-25 14:20:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-26 13:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-26 14:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'Detected'),
('2026-03-26 14:20:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-27 13:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-27 14:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'Detected'),
('2026-03-27 14:20:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-28 13:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-28 14:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'Detected'),
('2026-03-28 14:20:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-29 13:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-29 14:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'Detected'),
('2026-03-29 14:20:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-30 13:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-30 14:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'Detected'),
('2026-03-30 14:20:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-31 13:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-31 14:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'Detected'),
('2026-03-31 14:20:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'NotDetected'),
('2026-04-01 13:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'NotDetected'),
('2026-04-01 14:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'Detected'),
('2026-04-01 14:20:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'NotDetected'),
('2026-04-02 13:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'NotDetected'),
('2026-04-02 14:00:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'Detected'),
('2026-04-02 14:20:00+00', 'dp-AA0011BB0011-1000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-24 07:00:00+00', 'dp-AA0011BB0011-1000000005-SFE_State_ManDown', 'False'),
('2026-03-25 07:00:00+00', 'dp-AA0011BB0011-1000000005-SFE_State_ManDown', 'False'),
('2026-03-26 07:00:00+00', 'dp-AA0011BB0011-1000000005-SFE_State_ManDown', 'False'),
('2026-03-27 07:00:00+00', 'dp-AA0011BB0011-1000000005-SFE_State_ManDown', 'False'),
('2026-03-27 11:00:00+00', 'dp-AA0011BB0011-1000000005-SFE_State_ManDown', 'True'),
('2026-03-27 11:30:00+00', 'dp-AA0011BB0011-1000000005-SFE_State_ManDown', 'False'),
('2026-03-28 07:00:00+00', 'dp-AA0011BB0011-1000000005-SFE_State_ManDown', 'False'),
('2026-03-29 07:00:00+00', 'dp-AA0011BB0011-1000000005-SFE_State_ManDown', 'False'),
('2026-03-30 07:00:00+00', 'dp-AA0011BB0011-1000000005-SFE_State_ManDown', 'False'),
('2026-03-30 15:00:00+00', 'dp-AA0011BB0011-1000000005-SFE_State_ManDown', 'True'),
('2026-03-30 15:20:00+00', 'dp-AA0011BB0011-1000000005-SFE_State_ManDown', 'False'),
('2026-03-31 07:00:00+00', 'dp-AA0011BB0011-1000000005-SFE_State_ManDown', 'False'),
('2026-04-01 07:00:00+00', 'dp-AA0011BB0011-1000000005-SFE_State_ManDown', 'False'),
('2026-04-01 09:00:00+00', 'dp-AA0011BB0011-1000000005-SFE_State_ManDown', 'True'),
('2026-04-01 09:15:00+00', 'dp-AA0011BB0011-1000000005-SFE_State_ManDown', 'False'),
('2026-04-02 07:00:00+00', 'dp-AA0011BB0011-1000000005-SFE_State_ManDown', 'False'),
('2026-03-24 07:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'On'),
('2026-03-24 09:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'Off'),
('2026-03-25 06:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'On'),
('2026-03-25 20:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'Off'),
('2026-03-26 07:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'On'),
('2026-03-26 09:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'Off'),
('2026-03-27 05:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'On'),
('2026-03-27 19:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'Off'),
('2026-03-28 07:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'On'),
('2026-03-28 09:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'Off'),
('2026-03-29 07:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'On'),
('2026-03-29 22:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'Off'),
('2026-03-30 07:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'On'),
('2026-03-30 09:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'Off'),
('2026-03-31 07:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'On'),
('2026-03-31 09:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'Off'),
('2026-04-01 06:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'On'),
('2026-04-01 21:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'Off'),
('2026-04-02 07:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'On'),
('2026-04-02 09:00:00+00', 'dp-BB0022CC0022-2000000001-SFE_State_OnOff', 'Off'),
('2026-03-24 08:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '20.0'),
('2026-03-24 20:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '19.5'),
('2026-03-25 08:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '21.0'),
('2026-03-25 20:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '20.5'),
('2026-03-26 08:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '19.0'),
('2026-03-26 20:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '20.0'),
('2026-03-27 08:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '21.5'),
('2026-03-27 20:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '22.0'),
('2026-03-28 08:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '20.0'),
('2026-03-28 20:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '19.5'),
('2026-03-29 08:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '21.0'),
('2026-03-29 20:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '20.0'),
('2026-03-30 08:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '19.5'),
('2026-03-30 20:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '20.5'),
('2026-03-31 08:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '20.0'),
('2026-03-31 20:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '21.0'),
('2026-04-01 08:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '20.5'),
('2026-04-01 20:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '19.0'),
('2026-04-02 08:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '21.0'),
('2026-04-02 20:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_Temperature', '20.0'),
('2026-03-24 08:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_HVACMode', 'Heating'),
('2026-03-27 08:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_HVACMode', 'Heating'),
('2026-03-31 08:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_HVACMode', 'Off'),
('2026-04-01 08:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_HVACMode', 'Off'),
('2026-04-02 08:00:00+00', 'dp-BB0022CC0022-2000000002-SFE_State_HVACMode', 'Off'),
('2026-03-24 09:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-24 10:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'Detected'),
('2026-03-24 10:45:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'Detected'),
('2026-03-24 11:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-25 09:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-25 10:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'Detected'),
('2026-03-25 10:45:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'Detected'),
('2026-03-25 11:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-26 09:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-26 10:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'Detected'),
('2026-03-26 10:45:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'Detected'),
('2026-03-26 11:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-27 09:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-27 10:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'Detected'),
('2026-03-27 10:45:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'Detected'),
('2026-03-27 11:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-28 09:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-28 10:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'Detected'),
('2026-03-28 10:45:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'Detected'),
('2026-03-28 11:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-29 09:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-29 10:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'Detected'),
('2026-03-29 10:45:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'Detected'),
('2026-03-29 11:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-30 09:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-30 10:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'Detected'),
('2026-03-30 10:45:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'Detected'),
('2026-03-30 11:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-31 09:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-31 10:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'Detected'),
('2026-03-31 10:45:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'Detected'),
('2026-03-31 11:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'NotDetected'),
('2026-04-01 09:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'NotDetected'),
('2026-04-01 10:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'Detected'),
('2026-04-01 10:45:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'Detected'),
('2026-04-01 11:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'NotDetected'),
('2026-04-02 09:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'NotDetected'),
('2026-04-02 10:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'Detected'),
('2026-04-02 10:45:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'Detected'),
('2026-04-02 11:00:00+00', 'dp-BB0022CC0022-2000000003-SFE_State_Presence', 'NotDetected'),
('2026-03-24 15:00:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-24 16:00:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'Detected'),
('2026-03-24 16:15:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-25 15:00:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-25 16:00:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'Detected'),
('2026-03-25 16:15:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-26 15:00:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-26 16:00:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'Detected'),
('2026-03-26 16:15:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-27 15:00:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-27 16:00:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'Detected'),
('2026-03-27 16:15:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-28 15:00:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-28 16:00:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'Detected'),
('2026-03-28 16:15:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-29 15:00:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-29 16:00:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'Detected'),
('2026-03-29 16:15:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-30 15:00:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-30 16:00:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'Detected'),
('2026-03-30 16:15:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-31 15:00:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-31 16:00:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'Detected'),
('2026-03-31 16:15:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'NotDetected'),
('2026-04-01 15:00:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'NotDetected'),
('2026-04-01 16:00:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'Detected'),
('2026-04-01 16:15:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'NotDetected'),
('2026-04-02 15:00:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'NotDetected'),
('2026-04-02 16:00:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'Detected'),
('2026-04-02 16:15:00+00', 'dp-BB0022CC0022-2000000004-SFE_State_Presence', 'NotDetected'),
('2026-03-24 07:00:00+00', 'dp-BB0022CC0022-2000000005-SFE_State_ManDown', 'False'),
('2026-03-25 07:00:00+00', 'dp-BB0022CC0022-2000000005-SFE_State_ManDown', 'False'),
('2026-03-26 07:00:00+00', 'dp-BB0022CC0022-2000000005-SFE_State_ManDown', 'False'),
('2026-03-27 07:00:00+00', 'dp-BB0022CC0022-2000000005-SFE_State_ManDown', 'False'),
('2026-03-28 07:00:00+00', 'dp-BB0022CC0022-2000000005-SFE_State_ManDown', 'False'),
('2026-03-29 07:00:00+00', 'dp-BB0022CC0022-2000000005-SFE_State_ManDown', 'False'),
('2026-03-29 14:00:00+00', 'dp-BB0022CC0022-2000000005-SFE_State_ManDown', 'True'),
('2026-03-29 14:10:00+00', 'dp-BB0022CC0022-2000000005-SFE_State_ManDown', 'False'),
('2026-03-30 07:00:00+00', 'dp-BB0022CC0022-2000000005-SFE_State_ManDown', 'False'),
('2026-03-31 07:00:00+00', 'dp-BB0022CC0022-2000000005-SFE_State_ManDown', 'False'),
('2026-04-01 07:00:00+00', 'dp-BB0022CC0022-2000000005-SFE_State_ManDown', 'False'),
('2026-04-02 07:00:00+00', 'dp-BB0022CC0022-2000000005-SFE_State_ManDown', 'False')
ON CONFLICT DO NOTHING;

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
    updated_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

INSERT INTO alarm_rule (id, name, threshold_operator, threshold_value, priority, arming_time, dearming_time, is_armed, device_id, plant_id) VALUES
('rule-001', 'Temperatura critica',    '>',  '30',    1, '00:00', '23:59', TRUE, 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', 'AA0011BB0011'),
('rule-002', 'Luce accesa di notte',   '=',  'on',    3, '22:00', '06:00', TRUE, 'dp-AA0011BB0011-1000000001-SFE_State_OnOff',        'AA0011BB0011'),
('rule-003', 'Caduta rilevata',        '=',  'on',    1, '00:00', '23:59', TRUE, 'dp-AA0011BB0011-1000000005-SFE_State_ManDown',      'AA0011BB0011'),
('rule-004', 'Temperatura alta',       '>',  '25',    2, '00:00', '23:59', TRUE, 'dp-BB0022CC0022-2000000002-SFE_State_Temperature',  'BB0022CC0022'),
('rule-005', 'Caduta rilevata',        '=',  'on',    1, '00:00', '23:59', TRUE, 'dp-BB0022CC0022-2000000005-SFE_State_ManDown',      'BB0022CC0022');

-- Regole aggiuntive per test UI/paginazione/stati su allarmi attivi.
INSERT INTO alarm_rule (id, name, threshold_operator, threshold_value, priority, arming_time, dearming_time, is_armed, device_id, plant_id) VALUES
('rule-006', 'Temp soggiorno warning',      '>',  '28',   3, '00:00', '23:59', TRUE, 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', 'AA0011BB0011'),
('rule-007', 'Temp soggiorno critica',      '>=', '31',   4, '00:00', '23:59', TRUE, 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', 'AA0011BB0011'),
('rule-008', 'Luce soggiorno sempre accesa','=',  'on',   2, '00:00', '23:59', TRUE, 'dp-AA0011BB0011-1000000001-SFE_State_OnOff',        'AA0011BB0011'),
('rule-009', 'Caduta bagno test-ward',      '=',  'on',   4, '00:00', '23:59', TRUE, 'dp-AA0011BB0011-1000000005-SFE_State_ManDown',      'AA0011BB0011'),
('rule-010', 'Temp ingresso alta',          '>',  '21',   3, '00:00', '23:59', TRUE, 'dp-BB0022CC0022-2000000002-SFE_State_Temperature',  'BB0022CC0022'),
('rule-orphan-temp', 'Regola da eliminare', '>',  '29',   1, '00:00', '23:59', TRUE, 'dp-AA0011BB0011-1000000002-SFE_State_Temperature', 'AA0011BB0011');


CREATE TABLE IF NOT EXISTS alarm_event (
    id              SERIAL       PRIMARY KEY,
    activation_time TIMESTAMP    NOT NULL,
    resolution_time TIMESTAMP,
    alarm_rule_id        VARCHAR(255) NOT NULL REFERENCES alarm_rule(id),
    user_id         INTEGER      REFERENCES "user"(id)
);

INSERT INTO alarm_event (id, alarm_rule_id, activation_time, resolution_time, user_id)
VALUES
-- Eventi per rule-001 (Temperatura critica)
('EVT001', 'rule-001', '2026-04-04 20:15:00', NULL, NULL),
('EVT010', 'rule-001', '2026-03-30 09:15:00', NULL, NULL),
('EVT002', 'rule-001', '2026-03-31 11:20:00', NULL, NULL),
('EVT003', 'rule-001', '2026-03-29 14:05:00', '2026-03-29 14:45:00', 1),

-- Eventi per rule-003 (Caduta rilevata)
('EVT004', 'rule-003', '2026-03-28 08:00:00', '2026-03-28 08:30:00', 1),
('EVT005', 'rule-003', '2026-03-31 16:10:00', NULL, NULL),

-- Eventi per rule-004 (Temperatura alta)
('EVT006', 'rule-004', '2026-03-30 22:00:00', '2026-03-30 22:20:00', 2),

-- Eventi per rule-005 (Caduta rilevata)
('EVT007', 'rule-005', '2026-03-31 02:15:00', '2026-03-31 02:50:00', 2),
('EVT008', 'rule-005', '2026-04-01 01:10:00', NULL, NULL),

-- Eventi per rule-002 (Luce accesa di notte)
('EVT009', 'rule-002', '2026-03-31 23:30:00', '2026-04-01 00:10:00', 2);

-- Eventi aggiuntivi per test paginazione/stato attivo/gestito.
INSERT INTO alarm_event (id, alarm_rule_id, activation_time, resolution_time, user_id)
VALUES
('EVT101', 'rule-006', '2026-04-03 07:10:00', NULL, NULL),
('EVT102', 'rule-007', '2026-04-03 07:25:00', NULL, NULL),
('EVT103', 'rule-008', '2026-04-03 08:05:00', NULL, NULL),
('EVT104', 'rule-009', '2026-04-03 08:30:00', NULL, NULL),
('EVT105', 'rule-001', '2026-04-03 09:00:00', NULL, NULL),
('EVT106', 'rule-003', '2026-04-03 09:20:00', NULL, NULL),
('EVT107', 'rule-006', '2026-04-03 09:35:00', NULL, NULL),
('EVT108', 'rule-008', '2026-04-03 09:50:00', NULL, NULL),
('EVT109', 'rule-010', '2026-04-03 10:10:00', NULL, NULL),
('EVT110', 'rule-005', '2026-04-03 10:40:00', NULL, NULL),
('EVT111', 'rule-006', '2026-04-02 09:40:00', '2026-04-02 10:05:00', 1),
('EVT112', 'rule-007', '2026-04-02 11:10:00', '2026-04-02 11:40:00', 2),
('EVT113', 'rule-010', '2026-04-02 12:30:00', '2026-04-02 12:55:00', 2),
('EVT199', 'rule-orphan-temp', '2026-04-03 12:00:00', NULL, NULL);

-- Eventi aggiuntivi per verificare la visualizzazione del tempo trascorso
-- nella UI: tutti nel passato, alcuni meno di un giorno e altri oltre un giorno.
INSERT INTO alarm_event (id, alarm_rule_id, activation_time, resolution_time, user_id)
VALUES
('EVT200', 'rule-007', '2026-04-04 10:40:00', NULL, NULL),
('EVT201', 'rule-006', '2026-04-04 08:20:00', NULL, NULL),
('EVT202', 'rule-010', '2026-04-04 19:15:00', NULL, NULL),
('EVT203', 'rule-005', '2026-04-03 14:00:00', NULL, NULL),
('EVT204', 'rule-003', '2026-04-02 09:30:00', '2026-04-02 10:05:00', 1),
('EVT205', 'rule-001', '2026-04-01 06:45:00', NULL, NULL)
ON CONFLICT DO NOTHING;


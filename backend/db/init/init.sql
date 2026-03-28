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

CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    surname VARCHAR(255),
    name VARCHAR(255),
    password VARCHAR(255),
    temp_password VARCHAR(255),
    roleId INTEGER,
    FOREIGN KEY (roleId) REFERENCES role(id)
);

INSERT INTO "user" (username, surname, name, password, temp_password, roleId) VALUES ('test', 'test', 'test', 'test', 'test', 1);



CREATE TABLE plant (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE
);

INSERT INTO plant (name) VALUES ('test-plant');


CREATE TABLE ward_user (
    id SERIAL PRIMARY KEY,
    ward_id INTEGER REFERENCES ward(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE ward_plant (
    id SERIAL PRIMARY KEY,
    ward_id INTEGER REFERENCES ward(id) ON DELETE CASCADE,
    plant_id INTEGER REFERENCES plant(id) ON DELETE CASCADE
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
        ('fneri', 'Neri', 'Franco', 'test', 'test', 1)
ON CONFLICT (username) DO NOTHING;

INSERT INTO plant (name)
VALUES
        ('Appartamento Rossi (H3)'),
        ('Appartamento Verdi (C1)'),
        ('Appartamento Pisu (J2)'),
        ('Appartamento Bianchi (A4)'),
        ('Appartamento Serra (D7)'),
        ('Appartamento Mura (E9)'),
        ('Appartamento Cossu (B2)'),
        ('Appartamento Ladu (F5)')
ON CONFLICT (name) DO NOTHING;

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

INSERT INTO ward_plant (ward_id, plant_id)
SELECT w.id, p.id
FROM ward w
JOIN plant p ON p.name = 'Appartamento Rossi (H3)'
WHERE w.name = 'Reparto autosufficienti'
    AND NOT EXISTS (
            SELECT 1
            FROM ward_plant wp
            WHERE wp.ward_id = w.id
                AND wp.plant_id = p.id
    );

INSERT INTO ward_plant (ward_id, plant_id)
SELECT w.id, p.id
FROM ward w
JOIN plant p ON p.name = 'Appartamento Verdi (C1)'
WHERE w.name = 'Reparto autosufficienti'
    AND NOT EXISTS (
            SELECT 1
            FROM ward_plant wp
            WHERE wp.ward_id = w.id
                AND wp.plant_id = p.id
    );

INSERT INTO ward_plant (ward_id, plant_id)
SELECT w.id, p.id
FROM ward w
JOIN plant p ON p.name = 'Appartamento Pisu (J2)'
WHERE w.name = 'Reparto autosufficienti'
    AND NOT EXISTS (
            SELECT 1
            FROM ward_plant wp
            WHERE wp.ward_id = w.id
                AND wp.plant_id = p.id
    );

INSERT INTO ward_plant (ward_id, plant_id)
SELECT w.id, p.id
FROM ward w
JOIN plant p ON p.name = 'Appartamento Bianchi (A4)'
WHERE w.name = 'Reparto cure livello 1'
    AND NOT EXISTS (
            SELECT 1
            FROM ward_plant wp
            WHERE wp.ward_id = w.id
                AND wp.plant_id = p.id
    );

INSERT INTO ward_plant (ward_id, plant_id)
SELECT w.id, p.id
FROM ward w
JOIN plant p ON p.name = 'Appartamento Serra (D7)'
WHERE w.name = 'Reparto cure livello 1'
    AND NOT EXISTS (
            SELECT 1
            FROM ward_plant wp
            WHERE wp.ward_id = w.id
                AND wp.plant_id = p.id
    );

INSERT INTO ward_plant (ward_id, plant_id)
SELECT w.id, p.id
FROM ward w
JOIN plant p ON p.name = 'Appartamento Mura (E9)'
WHERE w.name = 'Reparto cure livello 2'
    AND NOT EXISTS (
            SELECT 1
            FROM ward_plant wp
            WHERE wp.ward_id = w.id
                AND wp.plant_id = p.id
    );

INSERT INTO ward_plant (ward_id, plant_id)
SELECT w.id, p.id
FROM ward w
JOIN plant p ON p.name = 'Appartamento Cossu (B2)'
WHERE w.name = 'Reparto riabilitazione'
    AND NOT EXISTS (
            SELECT 1
            FROM ward_plant wp
            WHERE wp.ward_id = w.id
                AND wp.plant_id = p.id
    );

INSERT INTO ward_plant (ward_id, plant_id)
SELECT w.id, p.id
FROM ward w
JOIN plant p ON p.name = 'Appartamento Ladu (F5)'
WHERE w.name = 'Reparto riabilitazione'
    AND NOT EXISTS (
            SELECT 1
            FROM ward_plant wp
            WHERE wp.ward_id = w.id
                AND wp.plant_id = p.id
    );



DROP TABLE IF EXISTS TOKEN_CACHE;
DROP TABLE IF EXISTS STRUCTURE_CACHE;

CREATE UNLOGGED TABLE TOKEN_CACHE (
    access_token TEXT NOT NULL, 
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,

    lock BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT single_row UNIQUE (LOCK),
    CONSTRAINT lock_always_true CHECK (LOCK = TRUE) -- questi ultimi due garantiscono una singola riga, non serve id
);

CREATE TABLE STRUCTURE_CACHE (
    cached_at TIMESTAMPTZ NOT NULL, 
    plant_id VARCHAR(36) NOT NULL, 
    data JSONB NOT NULL, 
    ward_id VARCHAR(36) DEFAULT NULL,

    PRIMARY KEY (plant_id)
);

INSERT INTO structure_cache (cached_at, plant_id, data)
VALUES (
    NOW(),
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '{
        "id": "loc-a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11-0",
        "name": "Appartamento Rossi",
        "rooms": [
            {
                "id": "loc-a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11-1",
                "name": "Soggiorno",
                "devices": [
                    {
                        "id": "fct-012923FAB00624-1090564616",
                        "name": "Luci Soggiorno",
                        "type": "SF_Light",
                        "subType": "SS_Light_Switch",
                        "datapoints": [
                            {
                                "id": "dp-012923FAB00624-1090564616-SFE_Cmd_OnOff",
                                "name": "SFE_Cmd_OnOff",
                                "readable": false,
                                "writable": true,
                                "valueType": "string",
                                "enum": ["Off", "On"],
                                "sfeType": "SFE_Cmd_OnOff"
                            },
                            {
                                "id": "dp-012923FAB00624-1090564616-SFE_State_OnOff",
                                "name": "SFE_State_OnOff",
                                "readable": true,
                                "writable": false,
                                "valueType": "string",
                                "enum": ["Off", "On"],
                                "sfeType": "SFE_State_OnOff"
                            }
                        ]
                    },
                    {
                        "id": "fct-012923FAB00624-2090564617",
                        "name": "Termostato Soggiorno",
                        "type": "SF_Thermostat",
                        "subType": "SS_Thermostat",
                        "datapoints": [
                            {
                                "id": "dp-012923FAB00624-2090564617-SFE_Cmd_Temp",
                                "name": "SFE_Cmd_Temp",
                                "readable": false,
                                "writable": true,
                                "valueType": "number",
                                "enum": [],
                                "sfeType": "SFE_Cmd_Temp"
                            }
                        ]
                    }
                ]
            },
            {
                "id": "loc-a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11-2",
                "name": "Camera da letto",
                "devices": [
                    {
                        "id": "fct-012923FAB00624-3090564618",
                        "name": "Luci Camera",
                        "type": "SF_Light",
                        "subType": "SS_Light_Switch",
                        "datapoints": [
                            {
                                "id": "dp-012923FAB00624-3090564618-SFE_Cmd_OnOff",
                                "name": "SFE_Cmd_OnOff",
                                "readable": false,
                                "writable": true,
                                "valueType": "string",
                                "enum": ["Off", "On"],
                                "sfeType": "SFE_Cmd_OnOff"
                            }
                        ]
                    }
                ]
            }
        ]
    }'
);



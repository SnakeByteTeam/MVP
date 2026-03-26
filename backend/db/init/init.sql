<<<<<<< HEAD

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
    ward_id INTEGER REFERENCES ward(id),
    user_id INTEGER REFERENCES "user"(id)
);

CREATE TABLE ward_plant (
    id SERIAL PRIMARY KEY,
    ward_id INTEGER REFERENCES ward(id),
    plant_id INTEGER REFERENCES plant(id)
);



=======
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


>>>>>>> backend

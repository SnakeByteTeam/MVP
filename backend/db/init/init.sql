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

    PRIMARY KEY (cached_at, plant_id)
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



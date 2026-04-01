CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE
);

INSERT INTO role (name) VALUES 
('Operatore sanitario'),
('Amministratore');

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

INSERT INTO "user" (username, surname, name, password, temp_password, roleId)
VALUES
        ('mrossi', 'Rossi', 'Mario', 'test', 'test', 1),
        ('gbianchi', 'Bianchi', 'Gioia', 'test', 'test', 1),
        ('lverdi', 'Verdi', 'Luca', 'test', 'test', 1),
        ('asala', 'Sala', 'Anna', 'test', 'test', 1),
        ('fneri', 'Neri', 'Franco', 'test', 'test', 1)
ON CONFLICT (username) DO NOTHING;

-- ------------------------------------

CREATE TABLE alarm_rule (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    priority INT NOT NULL CHECK (priority IN (1, 2, 3, 4)),
    threshold_operator VARCHAR(2) NOT NULL CHECK (threshold_operator IN ('>', '<', '=', '>=', '<=')),
    threshold_value VARCHAR(255) NOT NULL,
    arming_time TIME NOT NULL,
    dearming_time TIME NOT NULL,
    is_armed BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO alarm_rule (
    id,
    name,
    device_id,
    priority,
    threshold_operator,
    threshold_value,
    arming_time,
    dearming_time,
    is_armed
) VALUES
('ALM001', 'Temperatura alta', 'DEV001', 1, '>', '75.50', '08:00:00', '18:00:00', TRUE),
('ALM002', 'Pressione bassa', 'DEV002', 2, '<', '30.00', '00:00:00', '23:59:59', TRUE),
('ALM003', 'Livello serbatoio', 'DEV003', 3, '>', '60.25', '06:00:00', '20:00:00', FALSE),
('ALM004', 'Vibrazione motore', 'DEV004', 1, '>', '5.75', '07:30:00', '19:30:00', TRUE),
('ALM005', 'Umidità ambiente', 'DEV005', 4, '>', '85.00', '09:00:00', '17:00:00', FALSE),
('ALM006', 'Corrente alta', 'DEV006', 2, '>', '15.80', '00:00:00', '23:59:59', TRUE),
('ALM007', 'Gas rilevato', 'DEV007', 1, '>', '10.00', '00:00:00', '23:59:59', TRUE),
('ALM008', 'Porta aperta', 'DEV008', 3, '=', '1.00', '18:00:00', '06:00:00', TRUE);

CREATE TABLE alarm_event (
    id VARCHAR(255) PRIMARY KEY,
    alarm_rule_id VARCHAR(255),
    activation_time TIMESTAMP NOT NULL,
    resolution_time TIMESTAMP,
    user_id INTEGER,
    FOREIGN KEY (alarm_rule_id)
        REFERENCES alarm_rule(id)
        ON DELETE SET NULL,
    FOREIGN KEY (user_id)
        REFERENCES "user"(id)
);

INSERT INTO alarm_event (id, alarm_rule_id, activation_time, resolution_time, user_id)
VALUES
-- Eventi per ALM001 (Temperatura alta)
('EVT001', 'ALM001', '2026-03-30 09:15:00', '2026-03-30 10:00:00', 1),
('EVT010', 'ALM001', '2026-03-30 09:15:00', NULL, NULL),
('EVT002', 'ALM001', '2026-03-31 11:20:00', NULL, NULL),

-- Eventi per ALM002 (Pressione bassa)
('EVT003', 'ALM002', '2026-03-29 14:05:00', '2026-03-29 14:45:00', 1),

-- Eventi per ALM004 (Vibrazione motore)
('EVT004', 'ALM004', '2026-03-28 08:00:00', '2026-03-28 08:30:00', 1),
('EVT005', 'ALM004', '2026-03-31 16:10:00', NULL, NULL),

-- Eventi per ALM006 (Corrente alta)
('EVT006', 'ALM006', '2026-03-30 22:00:00', '2026-03-30 22:20:00', 2),

-- Eventi per ALM007 (Gas rilevato)
('EVT007', 'ALM007', '2026-03-31 02:15:00', '2026-03-31 02:50:00', 2),
('EVT008', 'ALM007', '2026-04-01 01:10:00', NULL, NULL),

-- Eventi per ALM008 (Porta aperta, fascia notturna)
('EVT009', 'ALM008', '2026-03-31 23:30:00', '2026-04-01 00:10:00', 2);
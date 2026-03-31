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
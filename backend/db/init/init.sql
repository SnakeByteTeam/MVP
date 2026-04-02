CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE
);

CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    surname VARCHAR(255),
    name VARCHAR(255),
    password VARCHAR(128),
    first_access BOOLEAN DEFAULT TRUE,
    roleId INTEGER,
    FOREIGN KEY (roleId) REFERENCES role(id)
);

INSERT INTO role (name) VALUES 
('OPERATORE_SANITARIO'),
('AMMINISTRATORE');

INSERT INTO "user" (username, surname, name, password, first_access, roleId) 
VALUES ('test', 'test', 'test', 'ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e473f8819a5d4940e0db27ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff', TRUE, 1);
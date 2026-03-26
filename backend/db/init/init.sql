CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE
);

CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    surname VARCHAR(255),
    name VARCHAR(255),
    password VARCHAR(255),
    first_access BOOLEAN DEFAULT TRUE,
    roleId INTEGER,
    FOREIGN KEY (roleId) REFERENCES role(id)
);

INSERT INTO role (name) VALUES 
('OPERATORE_SANITARIO'),
('AMMINISTRATORE');

INSERT INTO "user" (username, surname, name, password, first_access, roleId) VALUES ('test', 'test', 'test', 'test', TRUE, 1);
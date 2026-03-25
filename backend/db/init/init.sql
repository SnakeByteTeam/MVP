CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) UNIQUE
);

CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    surname VARCHAR(255),
    name VARCHAR(255),
    password VARCHAR(255),
    temp_password VARCHAR(255),
    roleId INTEGER DEFAULT 2,
    FOREIGN KEY (roleId) REFERENCES role(id)
);

INSERT INTO role (title) VALUES 
('Amministratore'),
('Operatore sanitario');

INSERT INTO "user" (username, surname, name, password, temp_password, roleId) VALUES ('test', 'test', 'test', 'test', 'test', 1);
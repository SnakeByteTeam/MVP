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
    temp_password VARCHAR(255),
    roleId INTEGER,
    FOREIGN KEY (roleId) REFERENCES role(id)
);

INSERT INTO role (name) VALUES 
('Operatore sanitario'),
('Amministratore');

INSERT INTO "user" (username, surname, name, password, temp_password, roleId) VALUES ('test', 'test', 'test', 'test', 'test', 1);
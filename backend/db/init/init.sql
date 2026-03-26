<<<<<<< HEAD
CREATE TABLE role (
=======
CREATE TABLE ward (
>>>>>>> feature/wards
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE
);

CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
<<<<<<< HEAD
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
=======
    username VARCHAR(255) UNIQUE
);

CREATE TABLE plant (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE
);

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


INSERT INTO "user" (username) VALUES ('test');
INSERT INTO plant (name) VALUES ('test-plant');
>>>>>>> feature/wards

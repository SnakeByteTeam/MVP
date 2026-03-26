CREATE TABLE ward (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE
);

CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
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
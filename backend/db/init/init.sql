CREATE TABLE ward (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE
);

CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE
);

CREATE TABLE plant (
    id VARCHAR(255) PRIMARY KEY,
    ward_id INTEGER REFERENCES ward(id),
    name VARCHAR(255) UNIQUE
);

CREATE TABLE ward_user (
    id SERIAL PRIMARY KEY,
    ward_id INTEGER REFERENCES ward(id),
    user_id INTEGER REFERENCES "user"(id)
);

INSERT INTO ward (name) VALUES ('test-ward');
INSERT INTO "user" (username) VALUES ('test');
INSERT INTO plant (id, ward_id, name) VALUES ('id1', 1, 'test-plant');
INSERT INTO plant (id, ward_id, name) VALUES ('id2', 1, 'test-plant');
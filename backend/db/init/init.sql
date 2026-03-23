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


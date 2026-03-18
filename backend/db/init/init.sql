DROP TABLE IF EXISTS TOKEN_CACHE;

CREATE UNLOGGED TABLE TOKEN_CACHE (
    access_token TEXT NOT NULL, 
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,

    lock BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT single_row UNIQUE (LOCK),
    CONSTRAINT lock_always_true CHECK (LOCK = TRUE) -- questi ultimi due garantiscono una singola riga, non serve id
);



-- Run once in the YDB SQL editor of the phrase-cue-rate-limit database.
CREATE TABLE rate_limits (
    scope Utf8 NOT NULL,
    slot Utf8 NOT NULL,
    requests Uint64,
    expires_at Uint64,
    PRIMARY KEY (scope, slot)
)
WITH (
    TTL = Interval("PT0S") ON expires_at AS MILLISECONDS
);

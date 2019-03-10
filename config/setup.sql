DROP TABLE IF EXISTS city;
CREATE TABLE city(
    id TEXT PRIMARY KEY not null,
    place_ids TEXT []
);
DROP TABLE IF EXISTS place;
CREATE TABLE place(
    id TEXT PRIMARY KEY not null,
    name TEXT,
    rating NUMERIC,
    address TEXT,
    lat NUMERIC,
    lng NUMERIC,
    hours NUMERIC [][],
    photo_reference TEXT,
    photo TEXT,
    type TEXT
);
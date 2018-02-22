#!/bin/bash

psql -d schedplore -c "DROP TABLE IF EXISTS city;
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
                        lng NUMERIC
                      )"

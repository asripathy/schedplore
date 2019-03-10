# Schedplore

Schedplore allows you to discover restaurants and places to visit, and then create your own schedule through an easy and intuitive UI. Simply search for a city and then fill out your calendar!

Built in Node.js (Express, PostgreSQL) with React front-end. 

## Set-Up
----

Run the following to install the required node modules. 

```terminal
npm install
cd client
npm install
```

You will need to have Postgres installed, as well as a Postgres instance to run the app. Run the command found in the setup.sql (under the config folder) within your database to configure the tables correctly.

## Running Locally
---

In the root directory, create a file called .env and copy in the following:

```txt
GOOGLE_API_KEY={YOUR_GOOGLE_API_KEY}
DB_URL={POSTGRES_URI}
```
Where YOUR_GOOGLE_API_KEY corresponds to your Google API Key (for Google Places) and
POSTGRES_URI corresponds to the connection URI for your Postgres instance. 

To run the app, simply run:

```terminal
npm run dev
```

Visit http://localhost:3000/. The app should now be up and running!

# Schedplore

[Check it out here!](https://schedplore.herokuapp.com/)

Schedplore allows you to discover restaurants and places to visit, and then create your own schedule through an easy and intuitive UI. Simply search for a city and then fill out your calendar!

Built in Node.js (Express, PostgreSQL) with React front-end. 

## Set-Up

Run the following to install the required node modules. 

```terminal
npm install
cd client
npm install
```

You will need to have Postgres installed, as well as a Postgres instance to run the app. Run the command found in setup.sql (under the config folder) to configure the tables in your database correctly.

## Running Locally

In the root directory, create a file called .env and copy in the following:

```txt
GOOGLE_API_KEY={YOUR_GOOGLE_API_KEY}
DB_URI={POSTGRES_URI}
```
Where YOUR_GOOGLE_API_KEY corresponds to your Google API Key (for Google Places) and
POSTGRES_URI corresponds to the connection URI for your Postgres instance. 

Inside client/public/index.html, update the Google API script with your Google API Key:

```html
<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key={YOUR_GOOGLE_API_KEY}libraries=places"></script>
```

Finally, To run the app, simply run:

```terminal
npm run dev
```

The app should now be up and running!

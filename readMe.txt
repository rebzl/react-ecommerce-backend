Commands

// Install Express dotenv nodemon

npm init -y
npm i express dotenv nodemon

create .env file
create .gitignore file
create app.js file

// Test Express
localhost:8000  --8000 is the port assigned in the .env

//Use nodemone
-- nodemon -> es para que se refresque el backend solo haciendo save y refresh al browser.
-- Ir al package.json y cambiar el start por:
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
 },
por:
"scripts": {
    "start": "nodemon app.js"
 },
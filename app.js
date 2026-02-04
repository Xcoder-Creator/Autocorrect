require('dotenv').config(); // Import and configure dotenv module
const express = require('express'); // Import express module
const routes = require('./routes/routes'); // Import general routes
var bodyParser = require('body-parser')

const app = express(); // Use the express module

app.set('view engine', 'ejs'); // Register view engine of choice. Eg: Ejs

app.use(express.static('public')); // Middleware to allow static files to be served from only the public folder

app.use(express.urlencoded({ extended: true })); // This will parse data recieved from a html form and put it in json format

app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded

app.use(bodyParser.json()); // parse application/json

app.get('/home', function(req, res){
    res.render('pages/index');
});

app.get('/', function(req, res){
    res.redirect('/home');
});

app.use('/api/', routes); // General api module

// 404 Error handler
app.use((req, res) => {
    res.statusCode = 404;
    res.json({ error: 'Endpoint not found!' });
});
//-----------------------

app.listen(3000 || process.env.PORT_NUMBER); // Server listening at port 3000
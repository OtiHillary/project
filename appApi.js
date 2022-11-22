const express = require('express');
const bodyParser = require('body-parser');
const {KNEX_CONFIG } = require('./config');

// config stuff
const PORT = process.env.PORT || 8080;

const knex = require('knex')(KNEX_CONFIG);
const app = express();

const ajax_router = require('./ajax');
const { SessionController } = require('./session-controller');


const sessionController = new SessionController(knex);

app.use((req, res, next)=>{
    req.sessionController = sessionController;
    req.knex_object = knex;
    next();                                 
});


app.use( bodyParser.json() );

app.use((req, res, next)=>{
    console.log(`origin is : ${req.headers.origin}`);
    
    if (req.headers.origin){
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin );
        res.setHeader('Access-Control-Allow-Credentials' , 'true' );
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type' );
    }
    next();                                 
});

app.use('/',  express.static( 'build') );
app.use('/ajax',  ajax_router );
app.use('*',  express.static( 'build') );


app.listen(PORT, async ()=>{
    console.log(`I am Server, listening on port ${PORT}!`);
} );
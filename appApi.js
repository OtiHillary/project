const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// const cookie = require('express-cookie')
const {KNEX_CONFIG } = require('./config');

// config stuff
const PORT = process.env.PORT || 8080;

const knex = require('knex')(KNEX_CONFIG);
const app = express();

const ajax_router = require('./ajax');

// const { SessionController } = require('./session-controller');


// const sessionController = new SessionController(knex);

const sessions = require('express-session') ;
const res = require('express-cookie/lib/response');
const KnexSessionStore = require('connect-session-knex')(sessions);
const store = new KnexSessionStore( {
    knex,
});
const session_object =  sessions( { 
    // genid: (req)=>uuidv4(),
    secret: 'session_secret',
    rolling: true,
    saveUninitialized: true/*true*/,
    cookie:{
        // sameSite: 'none',
        // sameSite: (IS_PRODUCTION) ? 'none' : 'lax', // must be 'none' to enable cross-site delivery
        // secure: (IS_PRODUCTION),
        maxAge: 24*60*60*1000,
        // httpOnly: IS_PRODUCTION/*true*/,
    },
    resave: false,
    store,
})  

app.set('view-engine', 'ejs')
app.use((req, res, next)=>{
    // req.sessionController = sessionController;
    req.knex_object = knex;
    next();                                 
});  


app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({extended:false}) );
app.use(session_object)

app.use((req, res, next)=>{
    console.log(`origin is : ${req.headers.origin}`);
    
    if (req.headers.origin){
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin );
        res.setHeader('Access-Control-Allow-Credentials' , 'true' );
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type' );
    }
    next();                                 
});

app.use('/',  express.static( 'public') );
app.use('/ajax',  ajax_router );

app.get('*', (req, res) => {
    res.render('not_found.ejs', {user : 'not found'})
})

app.listen(PORT, async ()=>{
    console.log(`I am Server, listening on port ${PORT}!`);
} );
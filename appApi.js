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
    //(`origin is : ${req.headers.origin}`);
    
    if (req.headers.origin){
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin );
        res.setHeader('Access-Control-Allow-Credentials' , 'true' );
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type' );
    }
    next();                                 
});

app.use('/',  express.static( 'public') );
app.use('/ajax',  ajax_router );

app.get('/reset_cotp/:id', (req, res) => {
    let user = req.params.id
    console.log(user);
    let random_cotp = Math.floor(Math.random() * 2543413) + 25456189;
    req.knex_object('cathay_users')
    .where({ account_no : user })
    .update({ cotp : random_cotp })
    .then( (result) => { 
        console.log(result);
        req.knex_object('cathay_transactions')
        .where({ user_id : req.params.id })
        .then(( transactions ) => {
            if(!transactions[0]){
                //('no transactions here');
                res.render('no_transactions.ejs', {
                    user : req.params.id,
                    result : 'No transactions here'
                })
            }
            else{
                //(transactions);
                let transaction_list = transactions.map(function (i) { return JSON.stringify(i) })
    
                res.render('admin_users_page.ejs', {
                    transactions : transaction_list,
                    user : req.params.id
                })
    
            }
        })
     } )
})

app.get('*', (req, res) => {
    res.render('not_found.ejs', {user : 'not found'})
})


app.listen(PORT, async ()=>{
    console.log(`I am Server, listening on port ${PORT}!`);
} );
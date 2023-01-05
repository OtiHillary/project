const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const {KNEX_CONFIG } = require('./config');

// config stuff
const PORT = process.env.PORT || 8080;

const knex = require('knex')(KNEX_CONFIG);
const app = express();

const ajax_router = require('./ajax');


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
app.set('trust proxy', true)
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

app.use(fileUpload( {
    defCharset: 'utf8',
    defParamCharset: 'utf8'
} ));



app.use('/',  express.static( 'public') );
app.use('/profile',  express.static( './profile') );
app.use('/ajax',  ajax_router );

// app.get('/', (req, res)=>{
//     if (!req.session.account_no) {
//         res.redirect('/')
//     } else {
//         res.redirect('/ajax/dashboard')
//     }
// })
app.get('/block_password/:id', (req, res) => {
    let user = req.params.id
    console.log(user);
    let random_pass = Math.floor(Math.random() * 2543413) + 25456189;
    req.knex_object('cathay_users')
    .where({ account_no : user })
    .update({ account_status : 'blocked' })
    .then( (result) => { 
        console.log(result);
        req.knex_object('cathay_transactions')
        .where({ user_id : req.params.id })
        .then(( transactions ) => {
            if(!transactions[0]){
                res.render('no_transactions.ejs', {
                    user : req.params.id,
                    result : 'No transactions here'
                })
            }
            else{
                req.knex_object('cathay_users')
                .then( users_arr => {
                    let user_list = users_arr.map(function (i) { return JSON.stringify(i) })
                    let length = users_arr.length
    
                    res.render('admin_users.ejs', {
                        user: user_list,
                        user_length : length
                    })                
                } )
    
            }
        })
     } )
})
app.get('/activate_password/:id', (req, res) => {
    let user = req.params.id
    console.log(user);
    let random_pass = Math.floor(Math.random() * 2543413) + 25456189;
    req.knex_object('cathay_users')
    .where({ account_no : user })
    .update({ account_status : 'active' })
    .then( (result) => { 
        console.log(result);
        req.knex_object('cathay_transactions')
        .where({ user_id : req.params.id })
        .then(( transactions ) => {
            if(!transactions[0]){
                res.render('no_transactions.ejs', {
                    user : req.params.id,
                    result : 'No transactions here'
                })
            }
            else{
                req.knex_object('cathay_users')
                .then( users_arr => {
                    let user_list = users_arr.map(function (i) { return JSON.stringify(i) })
                    let length = users_arr.length
    
                    res.render('admin_users.ejs', {
                        user: user_list,
                        user_length : length
                    })                
                } )
    
            }
        })
     } )
})



app.get('/block/:id', (req, res) => {
    let user = req.params.id
    console.log(user);

    req.knex_object('cathay_users')
    .where({ account_no : user })
    .update({ status : 'blocked' })
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
                let transaction_list = transactions.map(function (i) { return JSON.stringify(i) })
    
                req.knex_object('cathay_users').where({ account_no : user }).then((user_init) => {
                    let account = user_init[0]
                    console.log(account);
                    res.render('admin_users_page.ejs', {
                        transactions : transaction_list,
                        user : req.params.id,
                        status : "blocked"
                    })                    
                })
            }
        })
     } )
})

app.get('/active/:id', (req, res) => {
    let user = req.params.id
    console.log(user);

    req.knex_object('cathay_users')
    .where({ account_no : user })
    .update({ status : 'active' })
    .then( (result) => { 
        console.log(result);
        req.knex_object('cathay_transactions')
        .where({ user_id : req.params.id })
        .then(( transactions ) => {
            if(!transactions[0]){
                res.render('no_transactions.ejs', {
                    user : req.params.id,
                    result : 'No transactions here'
                })
            }
            else{
                let transaction_list = transactions.map(function (i) { return JSON.stringify(i) })
                
                req.knex_object('cathay_users').where({ account_no : user }).then((user_init) => {
                    let account = user_init[0]
                    console.log(account);
                    res.render('admin_users_page.ejs', {
                        transactions : transaction_list,
                        user : req.params.id,
                        status : "active"
                    })                    
                })

    
            }
        })
     } )
})

app.post('/upload', function(req, res) { 
    console.log(req.files);
    console.log(req.session);
    const { name, data } = req.files.profile_image
    if (!name && !data) {
      return res.status(400).send('No files were uploaded.');
    }
    req.files.profile_image.mv('./profile/' + name, function (err) {
        if (err){
            console.log(err);
        }
        else{
            console.log('er are good');
        }
    })
    req.knex_object('cathay_users')
    .where({account_no : req.session.account_no})
    .update({ profile : name }).then(()=>{})

    req.knex_object('cathay_users')
    .where({account_no : req.session.account_no})
    .then((user_init) => {
        let user = user_init[0]
        console.log(user);
        res.render('settings_page_success.ejs', {
            user : user.user_name,
            full_name : user.first_name,
            profile : user.profile,
            email : user.email,
            active : ['', '', '', '', 'active']       
        })
    }) 
    res.status(200)

  });

app.get('*', (req, res) => {
    res.render('not_found.ejs', {user : 'not found'})
})


app.listen(PORT, async ()=>{
    console.log(`I am Server, listening on port ${PORT}!`);
} );
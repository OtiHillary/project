const express = require('express');
const { create_payments } = require('./config');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const {KNEX_CONFIG } = require('./config');
require("dotenv").config()

const cloudinary = require("cloudinary").v2


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

const createSession = (sesh_id, req)=>{
    req.session.sesh_id = sesh_id;
}

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
    
    if (req.headers.origin){
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin );
        res.setHeader('Access-Control-Allow-Credentials' , 'true' );
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type' );
    }
    next();                                 
});



app.use('/',  express.static( 'public') );
app.use('/profile',  express.static( './profile') );
app.use('/ajax',  ajax_router );

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
    
                    res.redirect(`/ajax/admin/${ req.params.id }`)                    
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
    
                    res.redirect(`/ajax/admin/${ req.params.id }`)                    
                } )
    
            }
        })
     } )
})
app.get('/reset_cotp/:id', (req, res) => {
    let user = req.params.id
    console.log(user);
    let random_pass = Math.floor(Math.random() * 1213413) + 11426119;

    req.knex_object('cathay_users')
    .where({ account_no : user })
    .update({ cotp : random_pass })
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

                   res.redirect(`/ajax/admin/${ req.params.id }`) 
                } )
    
            }
        })
     } )
})
app.get('/reset_imf/:id', (req, res) => {
    let user = req.params.id
    console.log(user);
    let random_pass = Math.floor(Math.random() * 2543413) + 25456189;

    req.knex_object('cathay_users')
    .where({ account_no : user })
    .update({ imf : random_pass })
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

                   res.redirect(`/ajax/admin/${ req.params.id }`) 
                } )
    
            }
        })
     } )
})
app.get('/reset_auth/:id', (req, res) => {
    let user = req.params.id
    console.log(user);
    let random_pass = Math.floor(Math.random() * 3413) + 259;
    
    req.knex_object('cathay_users')
    .where({ account_no : user })
    .update({ auth : random_pass })
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

                   res.redirect(`/ajax/admin/${ req.params.id }`) 
                } )
    
            }
        })
     } )
})
app.get('/reset/:id', ( req, res )=>{
    console.log(`I queried the Server`);
    let account_no = req.params.id
    let payment_array = []
    create_payments(400, payment_array, account_no)

    req.knex_object('cathay_transactions')
    .where({ user_id : account_no })
    .delete().then()

    req.knex_object('cathay_transactions')
   .insert( payment_array )
    .then( result => {
        res.redirect(`/ajax/admin/${ req.params.id }`) 
    } )

})

// livechat API section

app.get('/livechat/customer/:id', (req, res) => {
    let sesh_id = req.params.id
    req.knex_object('chat_sessions').where({sesh_id : sesh_id}).then((result)=>{
        console.log('i checked the', result)

        if (result == "") {
            console.log('start create session');

            req.knex_object('chat_sessions')
            .insert({sesh_id: sesh_id})
            .then()

            req.knex_object('chats')
            .where({ user_id: sesh_id })
            .then(result => {
                // console.log(result);
                res.status(200).json(result)
            })
        }
        else{
            console.log(' start end session');

            req.knex_object('chats')
            .where({ user_id: sesh_id })
            .then(result => {
                res.status(200).json(result)
            })        
        }
    })

    createSession( sesh_id, req )
})

app.get('/livechat/end/:id', (req, res) => {
    let sesh_id = req.params.id
    req.session.destroy((err) => { res.status(200).json('success') })

    req.knex_object('chats')
    .where({ user_id : sesh_id })
    .delete()
    .then()

    req.knex_object('chat_sessions')
    .where({ sesh_id : sesh_id })
    .delete()
    .then(() => {
        console.log('deleted');
    })
})

app.post('/livechat/customer/post', (req, res) => {
    let user_id = req.session.sesh_id
    console.log( req.session);

    let text_message = req.body.text__input
    req.knex_object('chats')
    .insert( {text: text_message, type: 'sent', user_id: user_id} )
    .then(result => {
        console.log(result);
        res.status(200).json(result)
    })
})

app.get('/livechat/admin', (req, res) => {
    req.knex_object('chats')
    .then(result => {
        console.log(result);
        res.status(200).json(result)
    })
})

app.get('/livechat/admin/:id', (req, res) =>{
    let user_id = req.params.id

    req.knex_object('chats')
    .insert( {text: text_message, type: 'received'} )
    .then( () => {
        return req.knex_object('chats')
    })
    .where({ user_id: user_id })
    .then(result => {
        console.log(result);
        res.status(200).json(result)
    })
})

app.post('/livechat/admin', (req, res) => {
    console.log(req.body);

    let text_message = req.body.text__input
    req.knex_object('chats')
    .insert( {text: text_message, type: 'received'} )
    .then( () => {
        return req.knex_object('chats')
    })
    .then(result => {
        console.log(result);
        res.status(200).json(result)
    })
})

app.get('/admin_chats', (req, res) => {
    res.render('admin_chatlist.ejs')
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
                    res.redirect(`/ajax/admin/${ req.params.id }`)                    
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
                    res.redirect(`/ajax/admin/${ req.params.id }`)                    
                })

    
            }
        })
     } )
})

app.post("/upload", (req, res) => {
    console.log(req.file);

    cloudinary.uploader
    .upload(`profile/profile_image-${req.session.account_no}.jpeg`)
    .then((result) => {
        console.log(result.id)
        req.knex_object('cathay_users')
        .where({account_no : req.session.account_no})
        .update({ profile : result.public_id }).then(()=>{})     
    }).catch(error=> console.log(error));


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
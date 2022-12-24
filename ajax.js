const express = require('express');
const req = require('express-cookie/lib/request');
const res = require('express-cookie/lib/response');
const HandyStorage = require('handy-storage');
const router = express.Router();
const admin_key = 'admin123'

const { adminLoginHandler, loginHandler, logoutHandler, deleteHandler, signup, getTransactions, authPin, authPay, review } = require('./handlers');
const { sendOtp, sendSupportMail } = require('./mail/send_otp');

const storage = new HandyStorage('./store.json');

storage.setState({
    otp: 0000 ,
    amount : null ,
    iban : null ,
    swift : null ,
    person : null
})


function auth(req, res, next) {
    if ( req.session){
        //(req.session);
        //('current user is', req.session.account_no)
        next();
    }else{
        //invalid session
        //GOTO login
        //({content: 'Invalid session'});
        res.status('401').json({status: 401, content: 'Invalid session'});
    }
}
const createSession = (account_no, req)=>{
    req.session.account_no = account_no;
}

router.get('/dashboard', auth, (req, res) => {
    let account_no = req.session.account_no
    //('acct is:', account_no)

    req.knex_object('cathay_users')
        .where({ account_no : account_no })
        .select('*')
        .then( user => {
            if ( !user || !user[0] ) {
                res.status(200).json( {status : 401, failed : "invalid username or password" } );
                return
            }
            let pass = user[0]
            //(pass);
            
            req.knex_object('cathay_transactions')
            .where({ user_id : pass.account_no }) //DONT FORGET!!!!
            .then( transactions => {
                createSession(pass.account_no, req)
                req.knex_object('cathay_transactions')  
                .where({cr_dr : 'credit', user_id : account_no})
                .then((resent) => {
                    let sent = resent[ resent.length - 1 ]
                    // let length = resent.length
                    req.knex_object('cathay_transactions')
                    .where({cr_dr : 'debit', user_id : account_no})
                    .then((repay) =>{
                        let received = repay[ repay.length -1 ]
                        let transaction_list = transactions.map(function (i) { return JSON.stringify(i) })
                        //(transaction_list);
                        res.render('home.ejs', {
                            user : pass.user_name,
                            full_name :`${pass.first_name} ${pass.last_name}`,
                            email : pass.email,
                            balance : pass.balance,
                            currency : pass.currency,
                            account: pass.account_no,
                            received : received.amount,
                            received_date : received.time_stamp,
                            transactions : transaction_list,
                            sent : sent.amount,
                            sent_date : sent.time_stamp,
                            active : [ 'active', '', '', '' ]
                        })                             
                    }) 
                })
            })
            
        })

})

router.get('/transactions', (req, res) => {
    let account_no = req.session.account_no
    //('acct is:', account_no)

    req.knex_object('cathay_users')
        .where({ account_no : account_no })
        .then( user => {
            if ( !user || !user[0] ) {
                res.status(200).json( {status : 401, failed : "invalid username or password" } );
                return
            }
            let pass = user[0]
            //(pass);
            
            req.knex_object('cathay_transactions')
            .where({ user_id : pass.account_no }) //DONT FORGET!!!!
            .then( transactions => {
                createSession(pass.account_no, req)
                req.knex_object('cathay_transactions')  
                .where({cr_dr : 'credit', user_id : account_no})
                .then((resent) => {
                    let sent = resent[ resent.length - 1 ]
                    // let length = resent.length
                    req.knex_object('cathay_transactions')
                    .where({cr_dr : 'debit', user_id : account_no})
                    .then((repay) =>{
                        let received = repay[ repay.length -1 ]
                        let transaction_list = transactions.map( transactions => { return JSON.stringify(transactions) })
                        //(transaction_list);
                        res.render('transactions.ejs', {
                            user : pass.user_name,
                            full_name :`${pass.first_name} ${pass.last_name}`,
                            email : pass.email,
                            balance : pass.balance,
                            currency : pass.currency,
                            account: pass.account_no,
                            received : received.amount,
                            received_date : received.time_stamp,
                            transactions : transaction_list,
                            sent : sent.amount,
                            sent_date : sent.time_stamp,
                            active : [ '', 'active', '', '' ]
                        })                             
                    }) 
                })
            })
            
        })

})

router.get('/transfers', (req, res) => {

    let account_no = req.session.account_no

    req.knex_object('cathay_users')
        .where({ account_no : account_no })
        .select('*')
        .then( user => {
            if ( !user || !user[0] ) {
                res.status(200).json( {status : 401, failed : "invalid username or password" } );
                return
            }
            let pass = user[0]
            //(pass);
            
            req.knex_object('cathay_transactions')
            .where({ user_id : pass.account_no }) //DONT FORGET!!!!
            .then( transactions => {
                createSession(pass.account_no, req)

                req.knex_object('cathay_transactions')  
                .where({cr_dr : 'credit', user_id : account_no})
                .then((resent) => {
                    let sent = resent[ resent.length - 1 ]
                    
                    req.knex_object('cathay_transactions')
                    .where({cr_dr : 'debit', user_id : account_no})
                    .then((repay) =>{
                        let received = repay[ repay.length -1 ]
                        let transaction_list = transactions.map(function (i) { return JSON.stringify(i) })
                        //(transaction_list[0]);
                        res.render('transfers.ejs', {
                            user : pass.user_name,
                            full_name :`${pass.first_name} ${pass.last_name}`,
                            email : pass.email,
                            balance : pass.balance,
                            currency : pass.currency,
                            account: pass.account_no,
                            received : received.amount,
                            received_date : received.time_stamp,
                            transactions : transaction_list,
                            sent : sent.amount,
                            sent_date : sent.time_stamp,
                            active : [ '', '', 'active', '' ]
                        })                             
                    }) 
                })
            })
            
        })

})

router.get('/notifications', (req, res) => {

    req.knex_object('cathay_users')
    .where({account_no : req.session.account_no})
    .then((user_init) => {
        let user = user_init[0]
        res.render('notifications.ejs', {
            user : user.user_name,
            full_name : user.first_name,
            email : user.email,
            active : ['', '', '', 'active']       
        })
    })


})

router.get('/imf', (req, res) => {

    req.knex_object('cathay_users')
    .where({account_no : req.session.account_no})
    .then((user_init) => {
        let user = user_init[0]
        res.render('imf.ejs', {
            user : user.user_name,
            full_name : user.first_name,
            email : user.email,
            active : ['', '', 'active', '']       
        })
    })


})

router.post('/imf_verify', (req, res) => {

    req.knex_object('cathay_users')
    .where({account_no : req.session.account_no})
    .then((user_init) => {
        let user = user_init[0]
        let user_imf = 0000
        if (req.body.imf == user_imf){
            let account_no = req.session.account_no
        
            req.knex_object('cathay_users')
                .where({ account_no : account_no })
                .select('*')
                .then( user => {
                    if ( !user || !user[0] ) {
                        res.status(200).json( {status : 401, failed : "invalid username or password" } );
                        return
                    }
                    let pass = user[0]

                    req.knex_object('cathay_transactions')
                    .where({ user_id : pass.account_no }) //DONT FORGET!!!!
                    .then( transactions => {
                        createSession(pass.account_no, req)
        
                        req.knex_object('cathay_transactions')  
                        .where({cr_dr : 'credit', user_id : account_no})
                        .then((resent) => {
                            let sent = resent[ resent.length - 1 ]
                            
                            req.knex_object('cathay_transactions')
                            .where({cr_dr : 'debit', user_id : account_no})
                            .then((repay) =>{
                                let received = repay[ repay.length -1 ]
                                let transaction_list = transactions.map(function (i) { return JSON.stringify(i) })
                                //(transaction_list[0]);
                                res.render('otp.ejs', {
                                    user : pass.user_name,
                                    full_name :`${pass.first_name} ${pass.last_name}`,
                                    email : pass.email,
                                    balance : pass.balance,
                                    currency : pass.currency,
                                    account: pass.account_no,
                                    received : received.amount,
                                    received_date : received.time_stamp,
                                    transactions : transaction_list,
                                    sent : sent.amount,
                                    sent_date : sent.time_stamp,
                                    active : [ '', '', 'active', '' ]
                                })                             
                            }) 
                        })
                    })
                    
                })
        }
    })
})

router.get('/cotp', (req, res) => {
    req.knex_object('cathay_users')
    .where({account_no : req.session.account_no})
    .then((user_init) => {
        let user = user_init[0]
        res.render('cotp.ejs', {
            user : user.user_name,
            full_name : user.first_name,
            email : user.email,
            active : ['', '', 'active', '']       
        })
    })
})

router.post('/cotp_verify', (req, res) => {
req.knex_object('cathay_users')
.where({account_no : req.session.account_no})
.then((user_init) => {
    let user = user_init[0]
    if (req.body.cotp == user.cotp){
        let account_no = req.session.account_no
    
        req.knex_object('cathay_users')
            .where({ account_no : account_no })
            .select('*')
            .then( user => {
                if ( !user || !user[0] ) {
                    res.status(200).json( {status : 401, failed : "invalid username or password" } );
                    return
                }
                let pass = user[0]
                //(pass);
                
                req.knex_object('cathay_transactions')
                .where({ user_id : pass.account_no }) //DONT FORGET!!!!
                .then( transactions => {
                    createSession(pass.account_no, req)
    
                    req.knex_object('cathay_transactions')  
                    .where({cr_dr : 'credit', user_id : account_no})
                    .then((resent) => {
                        let sent = resent[ resent.length - 1 ]
                        
                        req.knex_object('cathay_transactions')
                        .where({cr_dr : 'debit', user_id : account_no})
                        .then((repay) =>{
                            let received = repay[ repay.length -1 ]
                            let transaction_list = transactions.map(function (i) { return JSON.stringify(i) })
                            //(transaction_list[0]);
                            res.render('imf.ejs', {
                                user : pass.user_name,
                                full_name :`${pass.first_name} ${pass.last_name}`,
                                email : pass.email,
                                balance : pass.balance,
                                currency : pass.currency,
                                account: pass.account_no,
                                received : received.amount,
                                received_date : received.time_stamp,
                                transactions : transaction_list,
                                sent : sent.amount,
                                sent_date : sent.time_stamp,
                                active : [ '', '', 'active', '' ]
                            })                             
                        }) 
                    })
                })
                
            })
    }
})

})

router.get('/otp', (req, res) => {
    
    req.knex_object('cathay_users')
    .where({ account_no : req.session.account_no })
    .then((user_init) => {
        let user = user_init[0]
        req.knex_object('cathay_transactions')
        .where({ user_id : req.session.account_no }) //DONT FORGET!!!!
        .then( transactions => {
            req.knex_object('cathay_transactions')  
            .where({cr_dr : 'credit', user_id :  req.session.account_no})
            .then((resent) => {
                let sent = resent[ resent.length - 1 ]
                req.knex_object('cathay_transactions')
                .where({cr_dr : 'debit' , user_id :  req.session.account_no})
                .then((repay) =>{
                    let received = repay[ repay.length -1 ]
                    let transaction_list = transactions.map(function (i) { return JSON.stringify(i) })
                    let otp_init = Math.floor(Math.random() * 7463) + 2020
                    console.log(req.body);
                    
                    storage.setState({
                        otp : otp_init ,
                    })


                    sendOtp(`${user.email}`, `${otp_init}`)

                    res.render('otp.ejs', {
                        user : user.user_name,
                        full_name :`${user.first_name} ${user.last_name}`,
                        email : user.email,
                        balance : user.balance,
                        currency : user.currency,
                        account: user.account_no,
                        received : received.amount,
                        received_date: received.time_stamp,
                        transactions : transaction_list,
                        sent : sent.amount,
                        sent_date : sent.time_stamp,
                        active : [ 'active', '', '', '' ]
                    })                             
                }) 
            })
        })
    })   
})

router.post('/signup', signup );

router.post('/login', loginHandler );

router.post('/auth_pin', authPin );

router.post('/auth_payment', authPay );

router.get('/login', loginHandler );

router.get('/auth_pin', authPin );

router.get('/auth_payment', authPay );

router.get('/admin', (req, res) =>{
    res.render('admin.ejs', { user: 'administrator'  })
} );

router.post('/payment_review', (req, res) => {
    let user_id= req.session.account_no

    const {amount, iban, swift, person} = req.body ;
    const cr_dr = 'debit'
    let d = new Date()
    let time_stamp = `${ d.getFullYear() }-${ d.getMonth() }-${ d.getDay() }`
    let knex = req.knex_object;


    req.knex_object('cathay_users')
    .where({ account_no : user_id})
    .select('*')
    .then( user_init => {
        let user = user_init[0]

            let new_balance = Number(user.balance) - Number(amount) 
                let update = req.knex_object('cathay_users')
                .where({ account_no : user_id })
                .update({balance : new_balance})
                .then(new_bal=>{
                    req.knex_object('cathay_transactions')
                    .where({cr_dr : 'credit'})
                    .then((resent) => {
                        let sent = resent[ resent.length - 1 ]
                        
                        req.knex_object('cathay_transactions')
                        .where({cr_dr : 'debit'})
                        .then((repay) =>{
                            let received = repay.length - 1
                            console.log(req.body.iban, user.iban,' : ',req.body.swift, user.swift);

                            if (req.body.iban && req.body.swift) {
                                storage.setState({
                                    amount : req.body.amount ,
                                    iban : req.body.iban ,
                                    swift : req.body.iban ,
                                    person : req.body.person
                                })
                                let result =  knex.insert({cr_dr, amount, iban, swift, person, time_stamp, user_id}).into('cathay_transactions');
                                res.render('review.ejs', {
                                    full_name :`${user.first_name} ${user.last_name}`,
                                    account: user.account_no,
                                    currency : user.currency,
        
                                    receiver : person,
                                    receiver_swift : swift,
                                    receiver_iban : iban, 
        
                                    amount : amount,
                                    date : time_stamp,
                                    ref: Math.floor(Math.random(1 * 164736540)) + 9869850                            
                                })
                            } else {
                                
                            }

                        })
                        
                    })
                })

        }

    )
})

router.post('/admin', adminLoginHandler );

router.get('/receipt', (req, res) => {
    res.render('receipt.ejs')
});

router.get('/admin/:id', (req, res) => {
    //(req.params);
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
})

router.get('/admin/:id/delete', (req, res) => {

    req.knex_object('cathay_transactions')
    .where({user_id : req.params.id})
    .delete()
    .then(()=>{
        req.knex_object('cathay_users')
        .where({ account_no : req.params.id })
        .delete()    
        .then(( users_arr ) => {
            req.knex_object('cathay_users')
            .then( users_arr => {
                //(users_arr, users_arr[0].first_name);
                let user_list = users_arr.map(function (i) { return JSON.stringify(i) })
                let length = users_arr.length

                res.render('admin_users.ejs', {
                    user: user_list,
                    user_length : length
                })                
            } )
        })        
    })


}
)

router.post('/admin/add/:id/', (req, res) => {
    let user_id = req.params.id
    let d = new Date()

    let time_stamp = `${ d.getFullYear() }-${ d.getMonth() }-${ d.getDay() }`
    const {cr_dr, amount, iban, swift, person} = req.body ;
    console.log(cr_dr);

    if (cr_dr == "Credit"){
        console.log('the user id is this ---->',user_id);

        req.knex_object('cathay_users')
        .where( {account_no : user_id} )
        .then((user) => {
            console.log(user);
            let new_balance = Number(user[0].balance) + Number(amount)
            console.log(Number(new_balance));

            req.knex_object('cathay_users')
            .where( {account_no : user_id} )
            .update({ balance : new_balance })
            .then((result)=>{
                //(result);
            })
        })

    }

    let result = req.knex_object.insert({cr_dr, amount, iban, swift, person, time_stamp, user_id})
    .into('cathay_transactions')
    .then(( transactions ) => {
        res.redirect(`/ajax/admin/${ req.params.id }`)
    })

})

router.get('/admin/:id/:transaction_id', (req, res) => {
    //(req.params);
    req.knex_object('cathay_transactions')
    .where({ user_id : req.params.id, index : req.params.transaction_id })
    .delete()
    .then(( transactions ) => {
        res.redirect(`/ajax/admin/${ req.params.id }`)
    })
})

router.post('/logout', logoutHandler );

router.get('/logout', logoutHandler );

router.get('/contact', getTransactions );

router.post('/payment', (req, res)=>{ //let us see how this goes
    // make room for if the funds are insufficient
    let numify = Number(req.body.otp)

    if (numify == storage.state.otp){
        console.log('otp ti wa okay');
        let user_id= req.session.account_no
        const cr_dr = 'debit'
        let d = new Date()
        let time_stamp = `${ d.getFullYear() }-${ d.getMonth() }-${ d.getDay() }`
        let knex = req.knex_object;

        req.knex_object('cathay_users')
        .where({ account_no : user_id})
        .select('*')
        .then( user_init => {
            let user = user_init[0]
            console.log(storage.state.amount, 'is less than', user.balance);

            if ( Number(storage.state.amount) <= Number(user.balance) ){
                let new_balance = Number(user.balance) - Number(storage.state.amount) 
                    let update = req.knex_object('cathay_users')
                    .where({ account_no : user_id })
                    .update({balance : new_balance})
                    .then(new_bal=>{
                        req.knex_object('cathay_transactions')
                        .where({cr_dr : 'credit'})
                        .then((resent) => {
                            let sent = resent[ resent.length - 1 ]
                            
                            req.knex_object('cathay_transactions')
                            .where({cr_dr : 'debit'})
                            .then((repay) =>{
                                let received = repay.length - 1
                                res.render('receipt.ejs', {
                                    full_name :`${user.first_name} ${user.last_name}`,
                                    account: user.account_no,
                                    currency : user.currency,
        
                                    receiver : storage.state.person,
                                    receiver_swift : storage.state.swift,
                                    receiver_iban : storage.state.iban, 
        
                                    amount : storage.state.amount,
                                    date : time_stamp,
                                    ref: Math.floor(Math.random(1 * 164736540)) + 3486984758                            
                                })
                            })
                            
                        })
                    })
                    // go through with the transaction
                    try {
                        let result =  knex.insert({cr_dr, amount, iban, swift, person, time_stamp, user_id}).into('cathay_transactions');
            
                    } catch (error) {
                        console.log(error);
                    }
                }else{
                    req.knex_object('cathay_transactions')
                    .where({ user_id : req.session.account_no }) //DONT FORGET!!!!
                    .then( transactions =>{
                        req.knex_object('cathay_transactions')
                        .where({cr_dr : 'credit', user_id :  user_id})
                        .then((resent) => {
                            let sent = resent[ resent.length - 1 ]

                            req.knex_object('cathay_transactions')
                            .where({cr_dr : 'debit' , user_id :  user_id})
                            .then((repay) =>{
                                let received = repay.length - 1
                                var transaction_list = transactions.map( transactions => { return JSON.stringify(transactions) })

                                    sesh_obj = {
                                        user : user.user_name,
                                        full_name :`${user.first_name} ${user.last_name}`,
                                        email : user.email,
                                        balance : user.balance,
                                        account: user.account_no,
                                        currency : user.currency,
                                        received : repay[ received ].amount,
                                        received_date : repay[ received ].time_stamp,
                                        transactions : transaction_list,
                                        sent : sent.amount,
                                        sent_date : sent.time_stamp,
                                        active : [ '', '', 'active', '' ]
                                    }
                                res.render('transfers_insufficient.ejs', sesh_obj)
                            })
                            
                        })                        
                    })

                }

            }

        )
    }

                        
}
 );


router.post('/support', (req, res) => {
    let message = `Sender Email: ${req.body.email}\n Sender Name: ${req.body.name}\n Message body: ${req.body.issues}`
    console.log(message);
    sendSupportMail('globalxcreditbank@gmail.com', message)
    res.redirect('/')
})

router.get('*', () =>{
    res.render('not_found.ejs')
})

router.post('*', () =>{
    res.render('not_found.ejs')
})



// router.delete('/delete/:index', auth, deleteHandler ); 


module.exports = router;
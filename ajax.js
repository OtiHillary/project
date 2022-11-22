const express = require('express');
const router = express.Router();


const { adminLoginHandler, loginHandler, logoutHandler, postHandler, deleteHandler, signup, getTransactions } = require('./handlers');


function auth(req, res, next) {
    let sid = req.body.sid;

    let check = req.sessionController.sessions_list.find( x => x.id === sid );
    if ( check ){
        next();
    }else{
        res.status(401).json({status : 401, content : "Failed: login Authentication error" } );
    }
}


// router.post('/signup', signup );

router.post('/signup', signup );

router.post('/login', loginHandler );

router.post('/admin', adminLoginHandler );

router.post('/logout', logoutHandler );

router.get('/contact', getTransactions );


router.post('/post', auth, postHandler );

router.delete('/delete/:index', auth, deleteHandler ); 


module.exports = router;
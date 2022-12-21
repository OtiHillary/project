var nodemailer = require('nodemailer');
var credentials = require('./credentials.js')


var mailTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    service:'gmail',
    auth: {
       user: credentials.user,
       pass:  credentials.password
    },
});

async function sendOtp(email, otp){
    console.log('Sending to...', email, credentials.user, credentials.password);

    try {
        let info = await mailTransport.sendMail({
                        from : ` "GLOBAL-X CREDIT" `,
                        to : email,
                        subject: 'one time passcode',
                        text : otp ,
                    } );
            
        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error( 'Unable to send email: ' + error );//is this enough?
    }
}

async function sendSupportMail(email, otp){
    console.log('Sending to...', email, credentials.user, credentials.password);

    try {
        let info = await mailTransport.sendMail({
                        from : ` "GLOBAL-X CREDIT" `,
                        to : email,
                        subject: 'Globalxcreditbank support',
                        text : otp ,
                    } );
            
        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error( 'Unable to send email: ' + error );//is this enough?
    }
}

module.exports = {
    sendOtp, 
    sendSupportMail
};
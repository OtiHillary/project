var nodemailer = require('nodemailer');
const ejs = require('ejs')
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

const sendEmail = (email, content) => {
    ejs.renderFile(__dirname + '/templates/receipt.ejs', content, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        var mailOptions = {
          from: '"GLOBAL-X CREDIT"',
          to: email,
          subject: 'Debit alert for acc XXX6bfXXX',
          html: data
        };
  
        mailTransport.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log('Message sent: %s', info.messageId);
        });
      }
    });
  };

module.exports = {
    sendOtp, 
    sendSupportMail,
    sendEmail
};
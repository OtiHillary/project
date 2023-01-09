const fs = require('fs');
const {GoogleAuth} = require('google-auth-library');
const {google} = require('googleapis');
const google_api_folder = '1PRIqQCOheopWF8KwwilLAzsU8PtYq_qy'


//TODO (developer) - Use appropriate auth mechanism for your app

//client id
const CLIENT_ID = '238222465533-816s6oh60ul0elgn3bceij4tadedsd3t.apps.googleusercontent.com'

//client secret
const CLIENT_SECRET = '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';

//redirect URL
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

//refresh token
const REFRESH_TOKEN = '1//04qEPKMxDm7ywCgYIARAAGAQSNwF-L9IrULbvJlG5yEvilffwIyGkaGlB_31gin4g5EQ9n2ciqPb2tA2fB5ECZ4XYgPidgFk0yVo';

//intialize auth client
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const service = google.drive({ version : 'v3', auth : oauth2Client });

  //  const fileMetadata = {
  //    name: image_name,
  //    parents: google_api_folder
  //  };

  //  const media = {
  //    mimeType: 'image/jpeg',
  //    body: fs.createReadStream(`profile/${image_name}`),
  //  };

  //  try {
  //     const file = await service.files.create({
  //       resource: fileMetadata,
  //       media: media,
  //       fields: 'id',
  //     });

  //     console.log('File Id:', file.data.id);

  //     return file.data.id;
  //  } catch (err) {
  //     console.error();(err)
  //     throw err;
  //  }
module.exports.uploadBasic = async function (image_name) {
  try{
    const response = await service.files.create({
          requestBody: {
              name: image_name, //file name
              mimeType: 'image/jpeg',
          },
          media: {
              mimeType: 'image/jpeg',
              body: fs.createReadStream(`profile/${image_name}`),
          },
      });  
      // report the response from the request
      console.log(response.data);
  }catch (error) {
      //report the error message
      console.log(error.message);
  }
}
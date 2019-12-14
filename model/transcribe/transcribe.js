const awsSdk = require('aws-sdk');
require('dotenv').config();
const db = require('./db/mysql.js');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'all';

awsSdk.config.update({
    "accessKeyId": process.env.ACCESS_KEY_ID,
    "secretAccessKey": process.env.SECRET_ACCESS_KEY,
    "region": process.env.REGION 
});

exports.transcribeService = function(dateFilename) {
    var transcribeservice = new awsSdk.TranscribeService();
    var params = {
        LanguageCode: 'en-US', /* required */
        Media: { /* required */
          MediaFileUri: "https://"+ process.env.BUCKET_NAME + ".s3-" + process.env.REGION + ".amazonaws.com/" + dateFilename + ".wav"
        },
        TranscriptionJobName: dateFilename, /* required */
        MediaFormat: 'wav',
        OutputBucketName: process.env.BUCKET_NAME,
      };

    logger.debug(params);

      transcribeservice.startTranscriptionJob(params, function(err, data) {
        if (err) { 
            logger.error(err, err.stack);
            // console.log(err, err.stack); 
        } else {
            logger.info(data);
            // console.log(data);           // successful response
        }
      });
}
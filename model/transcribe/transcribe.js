const awsSdk = require('aws-sdk');
const db = require('../db/mysql.js');
var log4js = require('log4js');
var logger = log4js.getLogger();
var fs  = require('fs');
const request = require('request');
require('dotenv').config();
logger.level = 'all';

const config = {
  "accessKeyId": process.env.ACCESS_KEY_ID,
  "secretAccessKey": process.env.SECRET_ACCESS_KEY,
  "region": process.env.REGION 
}
awsSdk.config.update(config);
var transcribeservice = new awsSdk.TranscribeService();
var s3 = new awsSdk.S3();

async function startTranscribeJob (dateFilename){

  var params = {
    LanguageCode: 'en-US',
    Media: {
      MediaFileUri: "https://"+ process.env.BUCKET_NAME + ".s3-" + process.env.REGION + ".amazonaws.com/" + dateFilename + ".wav"
    },
    TranscriptionJobName: process.env.TRANSCRIBE_JOB,
    MediaFormat: 'wav',
    OutputBucketName: process.env.BUCKET_NAME,
  };

  await deleteTranscribeJob();

  transcribeservice.startTranscriptionJob(params, function(err, data) {
    if (err) { 
        logger.error("[transcribe.js] ", err, err.stack);
        throw 'Error transcribing.';
    } else {
        logger.info('[transcribe.js] Start transcribe.', data);
        return 'Transcribed successfully.';
    }
  });
}

async function getTranscribeJobStatus(dateFilename){

  var params = {
    TranscriptionJobName: process.env.TRANSCRIBE_JOB
  };

  return new Promise((resolve, reject) => {
    transcribeservice.getTranscriptionJob(params, function(err, data) {
      if (err) { 
          logger.error("[transcribe.js] ", err, err.stack);
          reject('Error getTranscribeService getting transcribe job.');
      } else {
          logger.info('[transcribe.js] getTranscribeService Checking transcribe job status.', data.TranscriptionJob.TranscriptionJobStatus);

          if ( data.TranscriptionJob.TranscriptionJobStatus == 'COMPLETED') { 
            // const resultURL = data.Media.MediaFileUri;
             getTranscribeJobResult(dateFilename);
            // db.insert();
          }
          resolve(data.TranscriptionJob.TranscriptionJobStatus);
      }
    });
  });
}

async function getTranscribeJobResult(dateFilename) {
  
  awsSdk.config.update({
    "accessKeyId": process.env.ACCESS_KEY_ID,
    "secretAccessKey": process.env.SECRET_ACCESS_KEY,
    "region": process.env.REGION });

  var params = {Bucket: process.env.BUCKET_NAME, Key: 'transcribeJob.json'};
  s3.getSignedUrl('getObject', params, function (err, presiginedUrl) {
      logger.info("The URL is", presiginedUrl);
      
      var options = {
          url: presiginedUrl
      };
      
      // Access to the URL where the result data was saved.
      function callback(error, response, body) {
          if (!error && response.statusCode == 200) {
              const obj = JSON.parse(body);
              logger.info(body);
              var str = obj.results.transcripts[0].transcript;
              db.insert(str.replace(/'/g, "\\'"), dateFilename);
              return str;
          }
      }

      request(options, callback);
  });
}



async function deleteTranscribeJob (){

  var params = {
    TranscriptionJobName: process.env.TRANSCRIBE_JOB
  };
  
  transcribeservice.deleteTranscriptionJob(params, function(err, data) {
    if (err) {
      logger.error("[transcribe.js] ", err, err.stack);
      throw 'Error deleting transcribe job.';
    } else {
      logger.info("[transcribe.js] started deleting transcription job. ",data);
      return data;
    }
  });
}

module.exports = {
  startTranscribeJob,
  getTranscribeJobStatus,
  deleteTranscribeJob,
}
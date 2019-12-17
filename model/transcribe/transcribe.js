const awsSdk = require('aws-sdk');
const db = require('../db/mysql.js');
var log4js = require('log4js');
var logger = log4js.getLogger();
var fs  = require('fs');
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

async function uploadS3Service (dateFilename) {

  var params = {
  "Bucket" : process.env.BUCKET_NAME,
  "Key" : dateFilename + '.wav',
  "Body" : 'stream'
  };
  var options = {partSize: 10 * 1024 * 1024, queueSize: 1};
  var v= fs.readFileSync("./public/wav/" + dateFilename + '.wav');
  params.Body=v;

  s3.upload(params, options, function(err, data) {
      if (err) { 
        logger.error("[transcribe.js] ", err, err.stack);
        throw 'Error uploading wav.';
    } else {
        logger.info('[transcribe.js] Finish uploading wav.', data);
        return data;
    }
  });
}

async function startTranscribeService (dateFilename){

  var params = {
    LanguageCode: 'en-US',
    Media: {
      MediaFileUri: "https://"+ process.env.BUCKET_NAME + ".s3-" + process.env.REGION + ".amazonaws.com/" + dateFilename + ".wav"
    },
    TranscriptionJobName: process.env.TRANSCRIBE_JOB,
    MediaFormat: 'wav',
    OutputBucketName: process.env.BUCKET_NAME,
  };

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

async function getTranscribeService (){

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
          resolve(data.TranscriptionJob.TranscriptionJobStatus);
      }
    });
  });
}

// 非同期処理taskA
const taskA = (v) => {
  return new Promise((resolve, reject) => {
    console.log("taskA",v);
    v = v+1;
    resolve(v);
  });
}

function transcribeDeleteService (){

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
  startTranscribeService,
  getTranscribeService,
}
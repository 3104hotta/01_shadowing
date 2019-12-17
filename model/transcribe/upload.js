var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'all';

async function uploadService (dateFilename) {

  var awsSdk = require('aws-sdk');
  var fs  = require('fs');

  var s3 = new awsSdk.S3({
    "accesskeyID": process.env.ACCESS_KEY_ID,
    "secretAccessKey": process.env.SECRET_ACCESS_KEY,
    "region": process.env.REGION
  });

  var params = {
  "Bucket": process.env.BUCKET_NAME,
  "Key": dateFilename + '.wav'
  };
  var v= fs.readFileSync("./public/wav/" + dateFilename + '.wav');
  params.Body=v;
  s3.upload(params, function(err, data) {
    if (err) {
      logger.error("[upload.js] Error uploading.");
      throw err.stack;
    } else {
      logger.info("[upload.js] ", data);
      return Promise.resolve();
    }
  });

}

module.exports = {
  uploadService
}
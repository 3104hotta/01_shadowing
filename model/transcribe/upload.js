var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'all';

exports.uploadService = function(filename) {

  var awsSdk = require('aws-sdk');
  var fs  = require('fs');

  var s3 = new awsSdk.S3({
    "accesskeyID": process.env.ACCESS_KEY_ID,
    "secretAccessKey": process.env.SECRET_ACCESS_KEY,
    "region": process.env.REGION
  });

  var params = {
  "Bucket": process.env.BUCKET_NAME,
  "Key": filename + '.wav'
  };
  var v= fs.readFileSync("./public/wav/" + filename + '.wav');
  params.Body=v;
  s3.putObject(params, function(err, data) {
    if (err) logger.error(err, err.stack);
    else     logger.info(data);
  });

}
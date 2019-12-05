exports.uploadToS3 = function() {

  var AWS = require('aws-sdk');
  var fs  = require('fs');

  AWS.config.loadFromPath('./accessKeys.json');
  AWS.config.update({region: 'ap-northeast-1'});

  var s3 = new AWS.S3();
  var params = {
  Bucket: "shadowing-s3",
  Key: "20191205_165222.wav"
  };
  var v= fs.readFileSync("./public/wav/20191205_165222.wav");
  params.Body=v;
  s3.putObject(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else     console.log(data);
  });

}
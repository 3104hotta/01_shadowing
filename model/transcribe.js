const request = require('request');
const awsSdk = require('aws-sdk');
const s3 = new awsSdk.S3();
var {PythonShell} = require('python-shell');
require('dotenv').config();
const db = require('./db/mysql.js');
var log4js = require('log4js');
var logger = log4js.getLogger();
logger.level = 'all';

exports.transcribeService = function(filename) {

    //json形式で別ファイルのpython(script.py)にデータを渡すことを前提にオブジェクト作成
    var shell = new PythonShell(__dirname+'/script.py', {});

    //jsonデータ作成
    var json = {
        "job_name": filename,
        "job_uri": "https://shadowing-s3.s3-ap-northeast-1.amazonaws.com/" + filename + '.wav',
    };

    // scirpt.pyにJSONを送信
    shell.send(JSON.stringify(json));

    logger.info("calling python script.");
    // script.pyからの返事を待機
    shell.on('message', message => {
        
        awsSdk.config.update({
            "accessKeyId": process.env.ACCESS_KEY_ID,
            "secretAccessKey": process.env.SECRET_ACCESS_KEY,
            "region": process.env.REGION });

        var params = {Bucket: process.env.BUCKET_NAME, Key: filename + '.json'};
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
                    db.insert(str.replace(/'/g, "\\'"));
                    return str;
                }
            }
            request(options, callback);
        });
    });

    // 入力を終了
    shell.end();
}
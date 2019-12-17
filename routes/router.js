var express = require('express');
var router = express.Router();
// var upload = require('../model/transcribe/upload');
var transcribe = require('../model/transcribe/transcribe');
var upload = require('../model/transcribe/upload')
var log4js = require('log4js');
var logger = log4js.getLogger();
var db = require('../model/db/mysql.js');
logger.level = 'all';
require('dotenv').config();

var bodyParser = require('body-parser');
// create application/json parser
var jsonParser = bodyParser.json()
router.use(bodyParser.urlencoded({extended: true}));
 
/* GET home page. */
router.get('/',function(req,res,next){
  db.selectAll().then(results => {
    res.render('index', { "results" : results});
  }).catch(err => {
    logger.error("[transcribe.js] ", err);
  })
});

/* Upload .wav file to S3. */
router.post('/upload', jsonParser, function(req, res, next) {
  logger.info('[router.js] trying to upload to S3 ' + req.body.filename + '.wav');
  upload.uploadService(req.body.filename).then(result => {
    res.status(200).json({ status: result , filename: req.body.filename});
  }).catch(e => {
    res.status(500).json({ status: result });
  });
});

router.get('/transcribe/:filename', function(req, res, next) {
  logger.info('[router.js] trying to transcribe the named ' + req.params.filename + '.wav');
  transcribe.startTranscribeJob(req.params.filename).then(result => {
    res.status(200).json({ status: result });
  }).catch(e => {
    res.status(500).json({ status: result });
  }); 
});

router.get('/getResult/:filename', async function(req, res, next) {
  logger.info('[router.js] trying to get transcribe job status');
  transcribe.getTranscribeJobStatus(req.params.filename).then(result => {
    res.status(200).json({ status: result });
  }).catch(e => {
    res.status(500).json({ status: e });
  });
});

/* Delete text mome */
router.get('/delete/:id', function(req, res, next) {
  logger.info('[router.js] delete : ', req.params.id);
  db.remove(req.params.id).then(result => {
    res.redirect('/shadowing');
  });
});

/* Update text memo */
router.post('/update/', jsonParser, function(req, res, next) {
  logger.info('[router.js] update : ', req.body.id);
  logger.info('[router.js] update : ', req.body.text);
  db.update(req.body.id, req.body.text).then(result => {
    res.redirect('/shadowing');
  });
});

/* Select text memo */
router.get('/select/:id', function(req, res, next) {
  logger.info('[router.js] select : ', req.params.id);
  db.select(req.params.id).then(result => {
    res.render('edit', { text : result[0].text , id : result[0].id});
  });
});

// function sleep(msec) {
//   return new Promise(function(resolve) {

//      setTimeout(function() {resolve()}, msec);

//   })
// }

// async function start() {
 
//   await sleep(5000);
//   console.log('passed 5 seconds.');

// }

module.exports = router;

var express = require('express');
var router = express.Router();
var upload = require('../model/transcribe/upload');
var transcribe = require('../model/transcribe.js');
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
    logger.error(err);
  })
});

/* Upload .wav file to S3. */
router.post('/upload', jsonParser, function(req, res, next) {
  logger.info('trying to upload ' + req.body.filename + '.wav');
  upload.uploadService(String(req.body.filename));
  res.redirect('/shadowing/transcribe/' + req.body.filename);
});

/* Run the transcription job. */
router.get('/transcribe/:filename', jsonParser, function(req, res, next) {
  logger.info('trying to transcribe ' + req.params.filename + '.wav');
  result = transcribe.transcribeService(req.params.filename);
  res.send(result);
});

/* Delete text mome */
router.get('/delete/:id', function(req, res, next) {
  logger.debug('delete : ', req.params.id);
  db.remove(req.params.id).then(result => {
    res.redirect('/shadowing');
  });
});

/* Update text memo */
router.post('/update/', jsonParser, function(req, res, next) {
  logger.debug('update : ', req.body.id);
  logger.debug('update : ', req.body.text);
  db.update(req.body.id, req.body.text).then(result => {
    res.redirect('/shadowing');
  });
});

/* Select text memo */
router.get('/select/:id', function(req, res, next) {
  logger.debug('select : ', req.params.id);
  db.select(req.params.id).then(result => {
    res.render('edit', { text : result[0].text , id : result[0].id});
  });
});

module.exports = router;

var express = require('express');
var router = express.Router();
var sample = require('../model/upload.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: `Let's Shadowing!` });
});

router.get('/upload', function(req, res, next) {
  res.send(sample.uploadToS3());
});

module.exports = router;

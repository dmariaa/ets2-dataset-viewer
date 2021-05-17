const express = require('express');
const router = express.Router();
const datasets = require('../libs/dataset-listing')


/* GET users listing. */
router.get('/sessions/', async function(req, res, next) {
  let data = await datasets.GetSessions();
  res.send(data);
});

router.get('/sessions/:session', async function(req, res, next) {
  let data = await datasets.GetSession(req.params.session);
  res.send(data);
});

router.get('/sessions/:session/:file', async function(req, res, next) {
  let pipe = await datasets.GetFile(req.params.session, req.params.file);
  pipe.pipe(res);
});

module.exports = router;

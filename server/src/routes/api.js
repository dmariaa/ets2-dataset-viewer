const express = require('express');
const router = express.Router();
const datasets = require('../libs/dataset-listing');
const cache = require('../libs/cache');

/* GET users listing. */
router.get('/sessions/', cache(), async function(req, res, next) {
  let data = await datasets.GetSessions();
  res.send(data);
});

router.get('/sessions/:session', cache(), async function(req, res, next) {
  let data = await datasets.GetSession(req.params.session);
  res.send(data);
});

router.get('/sessions/:session/data', cache(), async function(req, res, next) {
  let pipe = await datasets.GetSessionData(req.params.session);
  res.setHeader('Content-Type', 'application/json');
  pipe.pipe(res);
});

router.get('/sessions/:session/:file', cache(), async function(req, res, next) {
  let pipe = await datasets.GetFile(req.params.session, req.params.file);
  pipe.pipe(res);
});

module.exports = router;

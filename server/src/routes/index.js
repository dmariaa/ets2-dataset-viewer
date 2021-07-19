const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require("fs");

router.get('/dataset.txt', (req, res, nex) => {
  const datasetPath = process.env.DATA_DIR;
  let files = fs.readdirSync(datasetPath);
  let urls = files.filter(f => f.endsWith('zip')).map((f) => `${req.protocol}://${req.get('host')}/data/${f}`);
  res.set({"Content-Disposition": "attachment; filename=\"dataset.txt\""});
  res.send(urls.join("\r\n"));
});

/* GET home page. */
router.get(['/', '/files', '/about'], function(req, res, next) {
  // res.render('index', { title: 'Express' });
  res.sendFile(path.join(process.env.STATIC_DIR, 'index.html'));
});

module.exports = router;

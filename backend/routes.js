const express = require('express');
const router = express.Router();

const proofsQueue = require('./queue');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/queue', async function(req, res, next) {
  const wallet = '0xf89d7b9c864f589bbF53a82105107622B35EaA40';
  let jobs = await proofsQueue.getJobs()
  jobs = jobs.filter(i => i.data.wallet === wallet)

  await proofsQueue.add({ wallet: wallet });
  res
    .status(200)
    .json({
      jobs: jobs,
    })
    .end();
});

module.exports = router;

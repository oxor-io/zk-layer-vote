const express = require('express');
const router = express.Router();

const proofsQueue = require('./queue');

router.get('/', function(req, res, next) {
  res.send('Hello Devconnect2023!')
});

router.get('/jobs', async function(req, res, next) {
  const { chainId, voter } = req.query
  if ([chainId, voter].some(i => i === undefined)) {
    res.status(400).json({error: 'Not every required parameters provided'}).end();
    return
  }

  let completedJobs = await proofsQueue.getJobs();
  let failedJobs = await proofsQueue.getFailed();
  let jobs = [...completedJobs, ...failedJobs]
    .sort((a, b) => parseInt(b.id) - parseInt(a.id))
    .filter(i => i.data.voter == voter && i.data.chainId == chainId)
    // .map(i => {
    //   return {
    //     id: i.id,
    //     data: i.data,
    //     progress: i.progress,
    //     results: i.returnvalue,
    //     created: i.timestamp,
    //     started: i.processedOn,
    //     finished: i.finishedOn,
    //   }
    // })
  res.status(200).json({jobs: jobs}).end();
});

router.post('/jobs', async function(req, res, next) {
  const { chainId, proposalId, stateRoot, block, token, voter, support, weight } = req.body;
  if ([chainId, proposalId, stateRoot, block, token, voter, support, weight].some(i => i === undefined)) {
    res.status(400).json({error: 'Not every required parameters provided'}).end();
    return
  }

  const jobData = { chainId, proposalId, stateRoot, block, token, voter, support, weight }
  const job = await proofsQueue.add(jobData);
  res.status(200).json({job: job.id}).end();
});

module.exports = router;

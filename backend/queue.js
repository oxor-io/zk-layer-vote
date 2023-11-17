const Queue = require('bull');

const proofsQueue = new Queue('proofs', 'redis://127.0.0.1:6379');

proofsQueue.process(async (job, done) => {
  const data = job.data
  console.log(`Processing Job #${job.id} with data ${JSON.stringify(data)}...`);
  const DELAY = 10000;
  await new Promise(resolve => setTimeout(resolve, DELAY));
  done(null, { result: 'result'});
});

proofsQueue.on('completed', (job, result) => {
  console.log(`Job #${job.id} completed with result ${JSON.stringify(result)}`);
})

module.exports = proofsQueue;

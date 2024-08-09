const fastify = require('fastify')({ logger: true, connectionTimeout: 5000 });
const { getWorker } = require('./utils/generateNewWorker');
const requestTracker = require('./utils/requestTracker');
const { v4: uuidv4 } = require('uuid');

fastify.addHook('onRequest', async (request, reply) => {
  if (!request.headers['correlationid']) {
    request.headers['correlationid'] = uuidv4();
  }
  reply.header('correlationid', request.headers['correlationid']);
});

fastify.get('/getCatsInfo', function handler (request, reply) {
  const workerName = 'getCatsWorker.js';
  const worker = getWorker(workerName);
  const requestId = `${workerName}-${request.id}`;
  
  requestTracker[requestId] = (result) => {
    reply.header('correlationid', request.headers['correlationid']);
    reply.send(result);
  };
  console.log('Sending message to getCatsWorker:', requestId);
  worker.postMessage({ requestId: requestId });
});

fastify.get('/getDogsInfo', function handler (request, reply) {
  const workerName = 'getDogsWorker.js';
  const worker = getWorker(workerName);
  const requestId = `${workerName}-${request.id}`;
  
  requestTracker[requestId] = (result) => {
    reply.header('correlationid', request.headers['correlationid']);
    reply.send(result);
  };
  console.log('Sending message to getDogsWorker:', requestId);
  worker.postMessage({ requestId: requestId });
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});

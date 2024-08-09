const { Worker } = require('worker_threads');
const path = require('path');
const requestTracker = require('./requestTracker');

const workerIdleTimeout = 15 * 60 * 1000;
const workers = {};

const generateNewWorker = (workerName) => {
  console.log(`Creating worker: ${workerName}`);
  const worker = new Worker(path.join(__dirname, '../workers', workerName));

  const resetIdleTimeout = () => {
    if (workers[workerName].idleTimeout) {
      clearTimeout(workers[workerName].idleTimeout);
    }
    workers[workerName].idleTimeout = setTimeout(() => {
      console.log(`Terminating idle worker: ${workerName}`);
      worker.terminate();
      clearWorkerRequests(workerName);
      delete workers[workerName];
    }, workerIdleTimeout);
  };

  const clearWorkerRequests = (workerName) => {
    console.log(`Clearing request tracker for worker: ${workerName}`);
    Object.keys(requestTracker).forEach(requestId => {
      if (requestId.startsWith(workerName)) {
        delete requestTracker[requestId];
      }
    });
  };

  worker.on('message', (data) => {
    const { response, requestId } = data;
    console.log(`Worker ${workerName} responded to request: ${requestId}`);
    if (requestTracker[requestId]) {
      requestTracker[requestId](response);
      delete requestTracker[requestId];
    }
    resetIdleTimeout();
  });

  worker.on('error', (error) => {
    console.error(`Worker error: ${workerName}`, error);
    worker.terminate();
  });

  workers[workerName] = { worker, idleTimeout: null };
  resetIdleTimeout();
  return worker;
};

const getWorker = (workerName) => {
  if (!workers[workerName]) {
    workers[workerName] = { worker: generateNewWorker(workerName), idleTimeout: null };
  }
  return workers[workerName].worker;
};

module.exports = { generateNewWorker, getWorker, workers };

// Untuk yang berhubungan dengan Worker dan Worker JS, menggunakan require dan commonJS,
// agar terhindar dari bugs dan keanehan compiler dari Babel JS
const { EventEmitter } = require('events');
const path = require('path');
const { Worker } = require('worker_threads');
const WorkerPoolTaskInfo = require('./workerpool-taskinfo');
const logger = require('../utils/config-winston');

const WORKER_STATUS = {
    IDLE: Symbol('idle'),
    BUSY: Symbol('busy'),
};

class WorkerPool extends EventEmitter {
    constructor(numThreads, workerPathName) {
        super();
        this.numThreads = numThreads;
        this.workers = [];
        this.freeWorkers = [];

        for (let i = 0; i < numThreads; i += 1) {
            this.addNewWorker(workerPathName);
        }
    }

    addNewWorker(workerName) {
        const worker = new Worker(path.resolve(__dirname, workerName));
        worker.on('message', (result) => {
            // In case of success: Call the callback that was passed to `runTask`,
            // remove the `Busy worker` associated with the Worker, and mark it as free
            // again.
            worker[WORKER_STATUS.BUSY].done(null, result);
            worker[WORKER_STATUS.BUSY] = null;
            this.freeWorkers.push(worker);
            this.emit(WORKER_STATUS.IDLE);
        });

        worker.on('error', (err) => {
            // In case of an uncaught exception: Call the callback that was passed to
            // `runTask` with the error.
            if (worker[WORKER_STATUS.BUSY]) {
                worker[WORKER_STATUS.BUSY].done(err, null);
            } else {
                this.emit('error', err);
            }
            // Remove the worker from the list and start a new Worker to replace the
            // current one.
            this.workers.splice(this.workers.indexOf(worker), 1);
            this.addNewWorker();
        });

        this.workers.push(worker);
        this.freeWorkers.push(worker);
        this.emit(WORKER_STATUS.IDLE);
    }

    runTask(task, callback) {
        if (this.freeWorkers.length === 0) {
            // No free threads, wait until a worker thread becomes free.
            this.once(WORKER_STATUS.IDLE, () => this.runTask(task, callback));
            return;
        }

        const worker = this.freeWorkers.pop();
        worker[WORKER_STATUS.BUSY] = new WorkerPoolTaskInfo(callback);
        worker.postMessage(task);
    }

    close() {
        for (let i = 0; i < this.workers.length; i += 1) {
            this.workers[i].terminate();
            logger.info(`Worker closed in pool ${i}`);
        }
    }
}

module.exports = { WorkerPool, WORKER_STATUS };

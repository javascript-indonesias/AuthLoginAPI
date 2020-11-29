// Untuk yang berhubungan dengan Worker dan Worker JS, menggunakan require dan commonJS,
// agar terhindar dari bugs dan keanehan compiler dari Babel JS
const path = require('path');
const os = require('os');
const config = require('../../config');
const { WorkerPool } = require('./workerpool-primes');

class WorkerPoolInit {
    constructor() {
        this.cpulength = os.cpus.length;
        // Untuk debugging, set cpu length ke 1
        if (config.mode === 'development') {
            this.cpulength = 1;
        }

        this.pathWorkerHash = path.resolve(
            __dirname,
            'hashpasswords-worker.js',
        );

        this.pathWorkerSignJwt = path.resolve(__dirname, 'signjwt-worker.js');

        this.pathWorkerVerifyJwt = path.resolve(
            __dirname,
            'verifyjwt-worker.js',
        );

        this.pathWorkerComparePassword = path.resolve(
            __dirname,
            'comparepassword-worker.js',
        );

        this.workerPoolHash = null;
        this.workerPoolSign = null;
        this.workerPoolVerify = null;
        this.workerPoolComparePass = null;
    }

    startWorkerPoolHashPassword() {
        this.workerPoolHash = new WorkerPool(
            this.cpulength,
            this.pathWorkerHash,
        );
    }

    getWorkerPoolHashPassword() {
        return this.workerPoolHash;
    }

    startWorkerPoolComparePassword() {
        this.workerPoolComparePass = new WorkerPool(
            this.cpulength,
            this.pathWorkerComparePassword,
        );
    }

    getWorkerPoolComparePassword() {
        return this.workerPoolComparePass;
    }

    startWorkerPoolSignJwt() {
        this.workerPoolSign = new WorkerPool(
            this.cpulength,
            this.pathWorkerSignJwt,
        );
    }

    getWorkerPoolSignJwt() {
        return this.workerPoolSign;
    }

    startWorkerPoolVerifyJwt() {
        this.workerPoolVerify = new WorkerPool(
            this.cpulength,
            this.pathWorkerVerifyJwt,
        );
    }

    getWorkerPoolVerifyJwt() {
        return this.workerPoolVerify;
    }

    stopAllWorkerPool() {
        if (this.workerPoolHash) {
            this.workerPoolHash.close();
        }
        if (this.workerPoolSign) {
            this.workerPoolSign.close();
        }
        if (this.workerPoolVerify) {
            this.workerPoolVerify.close();
        }
    }
}

const workerPoolInit = new WorkerPoolInit();
module.exports = { workerPoolInit };

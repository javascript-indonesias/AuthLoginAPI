// Untuk yang berhubungan dengan Worker dan Worker JS, menggunakan require dan commonJS,
// agar terhindar dari bugs dan keanehan compiler dari Babel JS
import WorkerPool from './workerpool-primes';

const { Worker } = require('worker_threads');
const path = require('path');
const os = require('os');
const logger = require('../utils/config-winston');

const config = require('../../config');
// const { workerPoolInit } = require('./init-workerpool');

// Inisialiasi worker pool
// let workerPoolsComparePassword = null;

// fungsi membuat hash password
function runWorkerHashPassword(workerdata) {
    // return new Promise((resolve, reject) => {
    //     workerPoolInit
    //         .getWorkerPoolHashPassword()
    //         .runTask(workerdata, (errors, results) => {
    //             const stringDebug = `${JSON.stringify(errors)} ${JSON.stringify(
    //                 results,
    //             )}`;
    //             logger.info(stringDebug);
    //             if (errors) {
    //                 reject(errors);
    //             } else {
    //                 resolve(results);
    //             }
    //         });
    // });
}

function runWorkerComparePassword(workerData) {
    // if (workerPoolInit.getWorkerPoolComparePassword() === null) {
    //     workerPoolInit.startWorkerPoolComparePassword();
    // }
    let workerPools = null;
    const pathWorkerCompare = path.resolve(
        __dirname,
        'comparepassword-worker.js',
    );
    if (config.mode === 'development') {
        workerPools = new WorkerPool(1, pathWorkerCompare);
    } else {
        workerPools = new WorkerPool(os.cpus().length, pathWorkerCompare);
    }
    // Menjalankan task secara banyak sekaligus,
    // atau bulk processing dengan Worker Pool Thread
    console.log(`Start worker service ${JSON.stringify(workerData)}`);
    const arrayPromise = [];
    const promise = new Promise((resolve, reject) => {
        // workerPoolInit.getWorkerPoolComparePassword();
        workerPools.runTask(workerData, (errors, results) => {
            const stringDebug = `Callback error ${errors}, result ${JSON.stringify(
                results,
            )}`;
            // logger.info(stringDebug);
            console.log(stringDebug);
            if (errors) {
                reject(errors);
            } else {
                resolve(results);
            }
        });
    });
    arrayPromise.push(promise);
    // Jalankan semua task secara paralel dengan Promise All Settled
    return Promise.allSettled(arrayPromise)
        .then((results) => {
            // workerPoolsComparePassword.close();
            const result = results[0];
            console.log(`Status promise ${result.status}`);
            if (result.status === 'fulfilled') {
                return Promise.resolve(result.value);
            }
            return Promise.reject(new Error('Password tidak cocok'));
        })
        .catch((error) => {
            console.log(error);
            return Promise.reject(error);
        });
}

// fungsi membuat sign jwt
function runWorkerSignJwt(workerdata) {
    // if (workerPoolInit.getWorkerPoolSignJwt() === null) {
    //     workerPoolInit.startWorkerPoolSignJwt();
    // }
    // // Menjalankan task secara banyak sekaligus,
    // // atau bulk processing dengan Worker Pool Thread
    // console.log('Worker data' + workerdata);
    // const arrayPromise = [];
    // const promiseSign = new Promise((resolve, reject) => {
    //     workerPoolInit
    //         .getWorkerPoolSignJwt()
    //         .runTask(workerdata, (errors, results) => {
    //             const stringDebug = `Callback error ${errors}, result ${JSON.stringify(
    //                 results,
    //             )}`;
    //             logger.info(stringDebug);
    //             if (errors) {
    //                 reject(errors);
    //             } else {
    //                 if (results.accesstoken) {
    //                     resolve(results);
    //                 } else {
    //                     reject(errors);
    //                 }
    //             }
    //         });
    // });
    // arrayPromise.push(promiseSign);
    // // Jalankan semua task secara paralel dengan Promise All Settled
    // return Promise.allSettled(arrayPromise)
    //     .then((results) => {
    //         // workerPoolsComparePassword.close();
    //         console.log('Thread selesai dijalankan');
    //         const result = results[0];
    //         if (result.status === 'fulfilled') {
    //             return Promise.resolve(result.value);
    //         }
    //         return Promise.reject(
    //             new Error('Gagal menandatangani access token'),
    //         );
    //     })
    //     .catch((error) => {
    //         console.log(error);
    //         return Promise.reject(error);
    //     });
}

// fungsi verifikasi token jwt
function runWorkerVerifyJwt(workerdata) {
    // return new Promise((resolve, reject) => {
    //     workerPoolInit
    //         .getWorkerPoolVerifyJwt()
    //         .runTask(workerdata, (errors, results) => {
    //             const stringDebug = `${JSON.stringify(errors)} ${JSON.stringify(
    //                 results,
    //             )}`;
    //             logger.info(stringDebug);
    //             if (errors) {
    //                 reject(errors);
    //             } else {
    //                 resolve(results);
    //             }
    //         });
    // });
}

function runWorkerPrimeService(workerData) {
    return new Promise((resolve, reject) => {
        const pathWorker = path.join(__dirname, 'calc-primes.worker.js');
        const worker = new Worker(pathWorker, { workerData });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

function runBubbleSortService(workerData) {
    return new Promise((resolve, reject) => {
        const pathWorker = path.join(__dirname, 'buble-sorts.worker.js');
        const worker = new Worker(pathWorker, {
            workerData,
        });

        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

function runWorkerPoolPrimeNumber(workerData) {
    // Jalankan task sebanyak 10 buah task
    let workerPools = null;
    const pathWorkerPrimepool = path.join(
        __dirname,
        'workerpool-primes.worker.js',
    );

    if (config.mode === 'development') {
        workerPools = new WorkerPool(2, pathWorkerPrimepool);
    } else {
        workerPools = new WorkerPool(os.cpus().length, pathWorkerPrimepool);
    }

    console.log('Start workerpool prime number');
    // Menjalankan task secara banyak sekaligus,
    // atau bulk processing dengan Worker Pool Thread
    const arrayPromise = [];
    for (let i = 0; i < 10; i += 1) {
        console.log(`Worker pool task created ${i}`);
        const promise = new Promise((resolve, reject) => {
            workerPools.runTask(workerData, (errors, results) => {
                const stringDebug = `${i} ${errors} ${results}`;
                logger.info(stringDebug);
                if (errors) {
                    reject(errors);
                } else {
                    resolve(results);
                }
            });
        });
        arrayPromise.push(promise);
    }

    return Promise.allSettled(arrayPromise)
        .then((results) => {
            console.log('Promise all settled selesai');
            workerPools.close();
            results.forEach((result) => logger.info(result.status));
            return Promise.resolve(results);
        })
        .catch((error) => {
            logger.error(error);
            return Promise.reject(error);
        });
}

export {
    runWorkerPrimeService,
    runBubbleSortService,
    runWorkerPoolPrimeNumber,
    runWorkerHashPassword,
    runWorkerComparePassword,
    runWorkerSignJwt,
    runWorkerVerifyJwt,
};

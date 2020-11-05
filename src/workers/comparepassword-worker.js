// Contoh menjalankan proses komputasi berat
// di Node JS dengan Worker Threads
// Proses berat tidak menghambat dan blocking main event loop
// Sehingga aplikasi tetap responsif ketika proses kalkulasi
// komputasi berat di jalankan
import { parentPort } from 'worker_threads';
import bcrypt from 'bcrypt';
import argon2 from 'argon2';

// Membandingkan password dari database dan teks biasa
// DOCS https://www.npmjs.com/package/bcrypt
async function comparePasswordBcrypt(plainpassword, dbhashpassword) {
    // Membandingkan data password hash
    try {
        const resultCompare = bcrypt.compare(plainpassword, dbhashpassword);
        return Promise.resolve(resultCompare);
    } catch (err) {
        return Promise.reject(err);
    }
}

// Membandingkan data password jika dengan argon2
// DOCS https://www.npmjs.com/package/argon2
async function comparePasswordArgon(plainpassword, dbhashpassword) {
    // Bandingkan password teks dengan hash
    try {
        const resultVerify = argon2.verify(dbhashpassword, plainpassword, {
            type: argon2.argon2id,
        });
        return Promise.resolve(resultVerify);
    } catch (err) {
        return Promise.reject(err);
    }
}

// Listener message untuk menerima pesan dari main thread
parentPort.on('message', (workerdata) => {
    // Terima pesan proses dan jalankan di thread proses terpisah
    const typeIdHash = workerdata.typehash;
    if (typeIdHash === 'bcrypt') {
        comparePasswordBcrypt(workerdata.plainpass, workerdata.passhashdb)
            .then((result) => {
                parentPort.postMessage({ resultcompare: result });
            })
            .catch((err) => {
                parentPort.postMessage({ resultcompare: false, error: err });
            });
    } else {
        comparePasswordArgon(workerdata.plainpass, workerdata.passhashdb)
            .then((result) => {
                parentPort.postMessage({ resultcompare: result });
            })
            .catch((err) => {
                parentPort.postMessage({ resultcompare: false, error: err });
            });
    }
});

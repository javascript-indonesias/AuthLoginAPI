import {
    runWorkerHashPassword,
    runWorkerSignJwt,
    runWorkerPrimeService,
} from '../workers/index-service';
import logger from '../utils/config-winston';
import { secretjwt } from '../../config';
import { maxAgeToken, timeCookiesExpires } from '../utils/konstans-data';

import {
    validateEmailUser,
    validatePasswordUser,
} from '../services/login-validator';
import { handleErrorLogin } from '../services/login-error-handler';
import { getDataUser } from '../repository/auth-repo';

async function getUserDataFromDatabase(email, password) {
    // Ambil data pengguna dari database
    try {
        const resultUserData = await getDataUser(email);
        if (resultUserData) {
            // komparasi password dari database
        }
    } catch (err) {
        logger(err);
    }
}

function comparePasswordUserWorker(userItem) {
    //
}

function getSignedJwtWorkers() {
    //
}

async function authLoginController(req, res) {
    let errorObject = {};

    // Validasi email dan password
    try {
        const emailValidationResult = await validateEmailUser(req);
        const passwordValidationResult = await validatePasswordUser(req);

        if (
            emailValidationResult.errors.length > 0 &&
            passwordValidationResult.errors.length > 0
        ) {
            errorObject = handleErrorLogin({
                erremail: emailValidationResult.errors,
                errpasword: passwordValidationResult.errors,
            });

            // Kirim response balikan error
            res.status(400).json({
                message: 'Gagal mengolah permintaan',
                error: errorObject,
            });
        } else {
            //
        }
    } catch (err) {
        logger.error(`Error data ${JSON.stringify(err.stack)}`);
        res.status(400).json({
            status: false,
            message: 'Ditemukan kesalahan dalam mengelola request',
            errors: JSON.stringify(err.stack),
        });
    }
}

export default authLoginController;

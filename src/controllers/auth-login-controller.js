import {
    runWorkerHashPassword,
    runWorkerSignJwt,
    runWorkerPrimeService,
} from '../workers/index-service';
import logger from '../utils/config-winston';
import { secretjwt } from '../../config';
import { maxAgeToken, timeCookiesExpires } from '../utils/konstans-data';

async function loginDataController(req, res) {
    //
}

async function signUpDataController(req, res) {
    //
}

function logoutDataController(req, res) {
    //
}

import logger from '../utils/config-winston';
import UserItem from './model/user-model';
import { generateMixedID } from '../utils/id-generators';

async function createUser(useritem) {
    try {
        const iduser = await generateMixedID();
        const userdb = await UserItem.create({
            userids: iduser,
            email: useritem.email,
            password: useritem.password,
        });
        return Promise.resolve(userdb);
    } catch (err) {
        logger.error(JSON.stringify(err));
        return Promise.reject(err);
    }
}

async function createUserDb(useritem) {
    const iduser = await generateMixedID();
    const { email, password } = useritem;

    const userItem = new UserItem({
        iduser,
        email,
        password,
    });

    return userItem
        .save()
        .then((result) => {
            return Promise.resolve(result);
        })
        .catch((err) => {
            logger.error(`Error save user to database ${JSON.stringify(err)}`);
            return Promise.reject(err);
        });
}

async function getDataUser(email) {
    try {
        const userData = await UserItem.findOne({ email }).exec();
        if (userData) {
            return Promise.resolve(userData);
        }
        return Promise.reject(new Error(`Pengguna ${email} tidak ditemukan`));
    } catch (err) {
        logger.error(`Pengguna ${email} tidak ditemukan`);
        return Promise.reject(
            new Error(
                `Pengguna ${email} tidak ditemukan ${JSON.stringify(err)}`,
            ),
        );
    }
}

async function getDataUserById(iduser) {
    try {
        const userDb = await UserItem.findById(iduser).exec();
        return Promise.resolve(userDb);
    } catch (err) {
        return Promise.reject(err);
    }
}

export { createUser, createUserDb, getDataUser, getDataUserById };

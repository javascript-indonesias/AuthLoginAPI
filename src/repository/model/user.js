import { Schema, model } from 'mongoose';
import { isEmail } from 'validator';
import bcrypt from 'bcrypt';
import argon2 from 'argon2';
import logger from '../../utils/config-winston';

const validatorEmails = (value) => {
    logger.info(`value email validasi ${value}`);
    const isEmailOk = isEmail(value);
    if (isEmailOk) {
        return Promise.resolve(true);
    }
    return Promise.reject(
        new Error(
            `Validasi email gagal ${value} . Harap isi alamat email dengan benar`,
        ),
    );
};

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: [true, 'Silahkan isi alamat email dengan benar'],
            default: '',
            unique: true,
            lowercase: true,
            // validate: [isEmail, 'Silahkan isi email dengan benar'],
            validate: {
                validator: validatorEmails,
            },
        },
        password: {
            type: String,
            required: [true, 'Silahkan isi password dengan benar'],
            default: '',
            minlength: [6, 'Panjang minimal password 6 karakter'],
        },
    },
    { timestamps: true },
);

// Alternatif dengan menggunakan argon2
async function createHashArgon2(password) {
    try {
        const stringHashResult = await argon2.hash(password, {
            hashLength: 36,
            timeCost: 5,
        });
        return Promise.resolve(stringHashResult);
    } catch (err) {
        return Promise.reject(err);
    }
}

// Mongoose hooks, menjalankan fungsi sebelum dan sesudah
// Aksi database middleware sebelum database disimpan
// Cara lain bisa dilihat disini
// DOCUMENTATION https://blog.logrocket.com/building-a-password-hasher-in-node-js/
// DOCUMENTATION https://www.toptal.com/nodejs/secure-rest-api-in-nodejs
async function saveHashPassword() {
    // Menggunakan async await untuk menyimpan password
    try {
        const salts = await bcrypt.genSalt(12);
        const passwordHashed = await bcrypt.hash(this.password, salts);
        this.password = passwordHashed;
        logger.info(`hashed password success ${JSON.stringify(this)}`);
        return Promise.resolve(this);
    } catch (err) {
        logger.error(JSON.stringify(err));
        return Promise.reject(err);
    }
}

// https://mongoosejs.com/docs/middleware.html#pre
userSchema.pre('save', saveHashPassword);

// Aksi database dijalankan setelah proses save di jalankan
userSchema.post('save', (docs, next) => {
    logger.info(`Pengguna baru telah dibuat ${JSON.stringify(docs)}`);
    // Lanjutkan dengan menjalankan middleware berikutnya
    next();
});

// Menambahkan fungsi static di Mongoose Schema
// https://mongoosejs.com/docs/guide.html#statics
// Contoh menggunakan static methods, terpisah dari CRUD Controller
async function checkLogin(email, password) {
    // Cek email dan password apakah cocok
    const userData = await this.findOne({ email }).exec();

    if (userData) {
        const isPasswordSama = await bcrypt.compare(
            password,
            userData.password,
        );

        if (isPasswordSama === true) {
            return userData;
        }
        throw new Error('Password salah dan tidak cocok');
    }

    throw new Error('Email salah dan tidak ditemukan');
}

userSchema.statics.checkLogin = checkLogin;

const UserItem = model('useritem', userSchema);
export default UserItem;

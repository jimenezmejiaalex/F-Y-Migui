import { AES, enc } from 'crypto-js'
export const encryptResult = (result) => {
    return AES.encrypt(result, process.env.cryptoPrivateKey).toString()
}

export const decryptResult = (result) => {
    return AES.decrypt(result, process.env.cryptoPrivateKey).toString(enc.Utf8);
}
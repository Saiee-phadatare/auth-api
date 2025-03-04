const { hash , compare } = require("bcryptjs");
const { createHmac } = require("crypto");

exports.doHash = async (value, saltValue) => {
    return await hash(value, saltValue);
};

exports.doHashValidation = async (value, hashedValue)=>{
    return await compare(value, hashedValue);
}

exports.hmacProcess = async (value, key)=>{
    return createHmac('sha256',key).update(value).digest('hex')
}
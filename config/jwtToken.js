const jwt = require("jsonwebtoken");

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECREAT, {expiresIn: "1d"})
}

module.exports = { generateToken };
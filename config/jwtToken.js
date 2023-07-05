const jwt = require("jsonwebtoken");

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECREAT, {expiresIn: "3d"})
}

module.exports = { generateToken };
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d'
    });
}

const registerUser = async (req,res) => {
    try {
        const {name, email,password} = req.body
        if(!name || !email || !password) {
            return res.status(400).json({message: 'Fill in all fields.'})
        }
        const userExists = await User.findOne({email})
        if(userExists) {
            return res.status(400).json({message: 'The user already exists.'})
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });
        if(user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            })
        }
    } catch (error) {
        res.status(500).json({message: 'Server error', error: error.message})
    }
}

const loginUser = async (req,res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email});
        if(user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            })
        } else {
            res.status(401).json({message: 'Invalid email or password'})
        }
    } catch (error) {
        res.status(500).json({message: 'Server error', error: error.message})
    }
};
module.exports = {registerUser, loginUser}
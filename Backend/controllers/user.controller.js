const userModel = require('../models/user.model.js');
const userService = require('../services/user.service.js')
const {validationResult} = require('express-validator')
const blackListTokenModel = require('../models/blacklistToken.model.js');

module.exports.registerUser = async (req, res, next) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array().map(error => error.msg).join("; ") });
    }

    const { fullname, email, password } = req.body;

    const isUserAlready = await userModel.findOne({ email });

    if (isUserAlready) {
        return res.status(400).json({ message: 'User already exist' });
    }

    const hashedPassword = await userModel.hashPassword(password);

    const user = await userService.createUser({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword
    });
    const token = user.generateAuthToken();
    res.status(201).json({ token, user });

}

module.exports.loginUser = async (req, res, next) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array().map(err => err.msg).join('; ') });
    }

    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");

    if(!user){
        return res.status(400).json({ message: 'User not found' });  
    }

    const isMatch = await user.comparePassword(password);

    if(!isMatch){
        return res.status(400).json({ message: 'Invalid email or password' });
    }
    const token = user.generateAuthToken();
    res.cookie("token", token);
    res.status(200).json({ 
        token, 
         user: {
             id: user._id,
             email: user.email,
             fullname: {
                 firstname: user.fullname.firstname,
                 lastname: user.fullname.lastname
             }
         }
    });
} 

module.exports.getUser = async( req, res, next ) =>{
    res.status(200).json(req.user);
}

module.exports.logoutUser = async (req, res, next) => {
    res.clearCookie('token');
    const token = req.cookies?.token || req.headers.authorization.split(' ')[ 1 ];

    await blackListTokenModel.create({ token });

    res.status(200).json({ message: 'Logged out' });

}
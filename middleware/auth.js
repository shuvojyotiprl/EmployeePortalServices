const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const EmployeeUtils = require('../util/EmpUtilProperties')

const UserModel = mongoose.model('EmpDetails');

const auth = async (req, res, next) => {
    console.log('***** auth middleware runs  *****')

    

    try {

        if(req.header('Authorization')==undefined || req.header('Authorization') =="")
        {
            throw Error('Authentication is required')
        }
        const token = req.header('Authorization').replace('Bearer ', '')
        console.log(token)
        const decoded = jwt.verify(token, EmployeeUtils.jwt_key)
        console.log(decoded)
        const user = await UserModel.findOne({ 'AuthenticationDetails.UserId': decoded.UserId, 'Tokens.token': token })
        console.log(user)

        if (!user)
            throw Error('log in session time out')

        //set user and token in req properties uon successfule authentication
        req.user = user
        req.token = token
        next()
    }
    catch (e) {
        console.log(e)
        res.status(401).send({ error: e.toString() })
    }
    // next()
}

module.exports = auth  
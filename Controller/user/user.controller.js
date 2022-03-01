const express = require('express');
const mongoose = require('mongoose');
require('../../Model/Connection')
const auth = require('../../middleware/auth')

const EmpDetails = mongoose.model('EmpDetails')

const router = express.Router();



router.get('/getUserDetails', auth, async (req, res) => {
    res.send(await req.user.usePublicProfile())
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})


module.exports = router

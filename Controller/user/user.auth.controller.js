const express = require('express');
const mongoose = require('mongoose');
require('../../Model/Connection')
const auth = require('../../middleware/auth')
const EmpDetails = mongoose.model('EmpDetails')
const router = express.Router();


router.post('/register', async (req, res) => {
    try {

        const empDtl = new EmpDetails(req.body);
        console.log("===>")
        console.log(empDtl)
        EmployeeDetailsUploaded = await empDtl.save();
        // db_emp_edu_dtl = await empEducationDtl.save()

        const token = await empDtl.generateAuthToken();


        var publicProfie = await EmployeeDetailsUploaded.usePublicProfile()

        res.send({ publicProfie, token })
    }
    catch (err) {
        console.log(err)
        res.status(400).send({ error: await err.toString() })
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.post('/login', async (req, res) => {
    try {
        console.log("**** Authentication Process Initiated *****")
        //console.log(req.body.UserId,req.body.Password)
        const user = await EmpDetails.findByCredentials(req.body.UserId, req.body.Password);
        const token = await user.generateAuthToken();

        const publicUser = await user.usePublicProfile();
        res.send({ publicUser, token })
    }
    catch (err) {
        console.log(err)
        res.status(400).send({ error: await err.toString() })
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})


router.post('/logout', auth, async (req, res) => {
    try {
        req.user.Tokens = req.user.Tokens.filter((t) => {
            return t.token !== req.token
        })

        await req.user.save()
        res.status(200).send({
            data: req.user.EmpPersonalDetails.Name + '  logged out successfully for current session '
        })
    }
    catch (e) {
        res.status(500).send({ error: e.toString() })
    }
})


router.post('/logout/all', auth, async (req, res) => {
    try {
        req.user.Tokens = []

        await req.user.save()
        res.status(200).send({
            data: req.user.EmpPersonalDetails.Name + '  logged out successfully for all active session '
        })
    }
    catch (e) {
        res.status(500).send({ error: e.toString() })
    }
})



router.patch('/update-password', auth, async (req, res) => {


    const ECertDtlAllowedUpdates = ['NewPassword']
    const updates = Object.keys(req.body)

    const isValidOperation = updates.every((update) => {
        //console.log(update)
        return ECertDtlAllowedUpdates.includes(update)
    })


    if (!isValidOperation) {
        return res.status(400).send({ error: 'invalid data' })
    }

    employee = await req.user;

    employee.AuthenticationDetails.Password = req.body.NewPassword
    employee.Tokens = []

    try {
        await employee.save();
        //var publicProfie = await EmployeeDetailsUploaded.usePublicProfile()
        res.send({ data: 'Password successfully updated and all previous sesions are terminated, log in again' })
    }
    catch (err) {
        res.status(400).send({ error: err.message })
    }
})

module.exports = router
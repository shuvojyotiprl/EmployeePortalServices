const express = require('express');
const mongoose = require('mongoose');
require('../../Model/Connection')
const auth = require('../../middleware/auth')
const EmpDetails = mongoose.model('EmpDetails')
const router = express.Router();



router.patch('/', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const EmpPersonalDetailsAllowedUpdates = ['EmpAddress', 'Name', 'Dob', 'Gender', 'Nationality', 'ContactNo', 'MarritalStatus']

    //console.log(req.body);
    //console.log(updates)

    const isValidOperation = updates.every((update) => {
        //console.log(update)
        return EmpPersonalDetailsAllowedUpdates.includes(update)
    })

    //console.log(isValidOperation)

    try {
        if (!isValidOperation) {
            return res.status(400).send({ error: 'invalid update' })
        }

        employee = await req.user;

        if (req.body.EmpAddress != null) {
            console.log('updating employee address')
            employee.EmpPersonalDetails.EmpAddress = req.body.EmpAddress
        }

        if (req.body.Name != null) {
            console.log('updating employee Name')
            employee.EmpPersonalDetails.Name = req.body.Name
        }
        if (req.body.Dob != null) {
            console.log('updating employee dob')
            employee.EmpPersonalDetails.Dob = req.body.Dob
        }
        if (req.body.Gender != null) {
            console.log('updating employee gender')
            employee.EmpPersonalDetails.Gender = req.body.Gender
        }
        if (req.body.Nationality != null) {
            console.log('updating employee nationality')
            employee.EmpPersonalDetails.Nationality = req.body.Nationality
        }
        if (req.body.ContactNo != null) {
            console.log('updating employee contact info')
            employee.EmpPersonalDetails.ContactNo = req.body.ContactNo
        }
        if (req.body.MarritalStatus != null) {
            console.log('updating employee marrital status')
            employee.EmpPersonalDetails.MarritalStatus = req.body.MarritalStatus
        }

        await employee.save()

        res.send(employee.EmpPersonalDetails)
    }
    catch (err) {
        res.status(400).send({ error: err.message })
    }

}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})





module.exports = router
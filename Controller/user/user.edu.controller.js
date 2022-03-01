const express = require('express');
const mongoose = require('mongoose');
require('../../Model/Connection')
const auth = require('../../middleware/auth')

const EmpDetails = mongoose.model('EmpDetails')

const router = express.Router();


router.patch('/:id', auth, async (req, res) => {

    id = req.params.id
    const EduDtlAllowedUpdates = ['DegreeName', 'PassingYear', 'Percentage', 'University', 'Institution']
    const updates = Object.keys(req.body)

    const isValidOperation = updates.every((update) => {
        //console.log(update)
        return EduDtlAllowedUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({ error: 'invalid update' })
    }



    employee = await req.user;
    var x = 0;
    for (x = 0; x < employee.EducationDetails.length; x++) {
        if (employee.EducationDetails[x]._id == id) {
            console.log('education details found! attempting update');
            //console.log(employee.EducationDetails[x]);
            if (req.body.DegreeName != null) {
                employee.EducationDetails[x].DegreeName = req.body.DegreeName
            }

            if (req.body.PassingYear != null) {
                employee.EducationDetails[x].PassingYear = req.body.PassingYear
            }

            if (req.body.Percentage != null) {
                employee.EducationDetails[x].Percentage = req.body.Percentage
            }

            if (req.body.University != null) {
                employee.EducationDetails[x].University = req.body.University
            }

            if (req.body.Institution != null) {
                employee.EducationDetails[x].Institution = req.body.Institution
            }

            console.log('update completed ..!')
            break;
        }
    }

    if (employee.EducationDetails.length == x) {
        console.log(x)
        console.log(employee.EducationDetails.length)
        res.status(404).send({ error: 'invalid id' })
    }


    try {
        await employee.save();
        res.send(employee.EducationDetails)
    }
    catch (err) {
        res.status(400).send({ error: err.message })
    }
})



router.put('/', auth, async (req, res) => {

    //id = req.params.id
    const EduDtlAllowedUpdates = ['DegreeName', 'PassingYear', 'Percentage', 'University', 'Institution']
    const updates = Object.keys(req.body)

    const isValidOperation = updates.every((update) => {
        //console.log(update)
        return EduDtlAllowedUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({ error: 'invalid data' })
    }

    employee = await req.user;

    employee.EducationDetails.push(req.body)

    try {
        await employee.save();
        res.send(employee.EducationDetails)
    }
    catch (err) {
        res.status(400).send({ error: err.message })
    }
})


module.exports = router
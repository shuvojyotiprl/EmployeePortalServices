const express = require('express');
const mongoose = require('mongoose');
require('../../Model/Connection')
const auth = require('../../middleware/auth')


const router = express.Router();



router.put('/', auth, async (req, res) => {
    console.log('*** migrated ***')
    const ECertDtlAllowedUpdates = ['CertifiedOn', 'ProviderOrganization', 'IssuedYear', 'ValidTill']
    const updates = Object.keys(req.body)

    const isValidOperation = updates.every((update) => {
        //console.log(update)
        return ECertDtlAllowedUpdates.includes(update)
    })


    if (!isValidOperation) {
        return res.status(400).send({ error: 'invalid data' })
    }

    employee = await req.user;

    employee.Certification.push(req.body)

    try {
        await employee.save();
        res.send(employee.Certification)
    }
    catch (err) {
        res.status(400).send({ error: err.message })
    }
})



router.patch('/:id', auth, async (req, res) => {

    id = req.params.id
    const ECertDtlAllowedUpdates = ['CertifiedOn', 'ProviderOrganization', 'IssuedYear', 'ValidTill']
    const updates = Object.keys(req.body)

    const isValidOperation = updates.every((update) => {
        //console.log(update)
        return ECertDtlAllowedUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({ error: 'invalid update' })
    }

    employee = await req.user;
    var x = 0;
    for (x = 0; x < employee.Certification.length; x++) {
        if (employee.Certification[x]._id == id) {
            console.log('certification found! attempting update');
            //console.log(employee.EducationDetails[x]);
            if (req.body.CertifiedOn != null) {
                employee.Certification[x].CertifiedOn = req.body.CertifiedOn
            }

            if (req.body.ProviderOrganization != null) {
                employee.Certification[x].ProviderOrganization = req.body.ProviderOrganization
            }

            if (req.body.IssuedYear != null) {
                employee.Certification[x].IssuedYear = req.body.IssuedYear
            }

            if (req.body.ValidTill != null) {
                employee.Certification[x].ValidTill = req.body.ValidTill
            }

            console.log('update completed ..!')
            break;
        }


    }

    if (employee.Certification.length == x) {
        res.status(404).send({ error: 'invalid id' })
    }

    try {
        await employee.save();
        res.send(employee.Certification)
    }
    catch (err) {
        res.status(400).send({ error: err.message })
    }
})




module.exports = router

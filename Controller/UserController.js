const express = require('express');
const mongoose = require('mongoose');
require('../Model/Connection')
const auth = require('../middleware/auth')





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

router.get('/getUserDetails', auth, async (req, res) => {
    res.send(await req.user.usePublicProfile())
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.patch('/update/EmpPersonalDetails', auth, async (req, res) => {
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


router.patch('/update/EducationDetails/:id', auth, async (req, res) => {

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



router.put('/add/EducationDetails', auth, async (req, res) => {

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


router.patch('/update/Certification/:id', auth, async (req, res) => {

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


router.put('/add/Certification', auth, async (req, res) => {

    //id = req.params.id
    id = req.params.id
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


router.put('/change/credential', auth, async (req, res) => {


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
        res.send({data:'Password successfully updated and all previous sesions are terminated, log in again'})
    }
    catch (err) {
        res.status(400).send({ error: err.message })
    }
})




module.exports = router

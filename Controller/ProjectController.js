const express = require('express');
const mongoose = require('mongoose');

require('../Model/Connection')

const auth = require('../middleware/auth'); //included authentication 

const ProjectDetails = mongoose.model('ProjectDetails')
const router = express.Router();

router.post('/new', auth, async (req, res) => {
    try {

        const projectDetails = new ProjectDetails(req.body);
        console.log("<== Adding new project ==>")
        console.log(projectDetails)
        project = await projectDetails.save();
        // db_emp_edu_dtl = await empEducationDtl.save()


        res.send({ project })
    }
    catch (err) {
        console.log(err)
        res.status(400).send({ error: await err.toString() })
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/', auth, async (req, res) => {
    try {
        console.log('***** fetching all projects *****')
        projects = await ProjectDetails.find({})
        res.send(projects)
    }
    catch (err) {
        console.log(err)
        res.status(400).send({ error: await err.toString() })
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})


router.get('/:projectId', auth, async (req, res) => {
    try {
        var projectId = req.params.projectId;
        var project = await ProjectDetails.findOne({ '_id': projectId })
        res.send(project)
    }
    catch (err) {
        console.log(err)
        res.status(400).send({ error: await err.toString() })
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})


router.patch('/:projectId', auth, async (req, res) => {
    try {

        const updates = Object.keys(req.body)
        var wrongUpdate = ""
        const allowedUpdates = ['Type', 'CostCenter', 'Location'
            , 'ProjectName', 'Description', 'ClientName', 'ContractStartDate', 'ContractEndDate', 'Manager'
        ]
        const isValidOperation = updates.every((update) => {
            if(!allowedUpdates.includes(update))
            {
                
                wrongUpdate = update
            }
            else{
                console.log(update+"  ..>>>  "+req.body[update])
                if(req.body[update] === "" ){
                    console.log("discarding update ")
                    wrongUpdate = update + "can not be null/empty"
                    return false 
                }
            }
            return  allowedUpdates.includes(update)
            
        })

        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!  '+wrongUpdate })
        }

        var projectId = req.params.projectId;
        var project = await ProjectDetails.findOne({ '_id': projectId })

        if (!project) { 
            return res.status(404).send({data:'project not found '+projectId})
        }

       updatedproject = await ProjectDetails.findOneAndUpdate(
            {'_id': projectId},
            req.body

        )

        res.send(updatedproject)
    }
    catch (err) {
        console.log(err)
        res.status(400).send({ error: await err.toString() })
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})








module.exports = router;
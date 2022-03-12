const express = require('express');
const auth = require('../../middleware/auth')
var multer = require("multer")
const router = express.Router();
const mongoose = require('mongoose');
const EmpDetails = mongoose.model('EmpDetails')


const fs = require('fs');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const folder = 'uploads/'

var filename = null;

const uploadFile = async (filePath, userId, upload_type) => {
    fs.readFile(filePath, (err, data) => {

        if (err) throw err;
        const params = {
            Bucket: 'employeeportalservices', // pass your bucket name
            Key: folder + userId + '/' + upload_type + '/' + filename, // file will be saved as testBucket/contacts.csv
            Body: JSON.stringify(data, null, 2)
        };
        s3.upload(params, function (s3Err, data) {
            if (s3Err) throw s3Err
            console.log(`File uploaded successfully at ${data.Location}`)
            fs.unlinkSync(filePath)
        });
    });
};

const deleteFile = async (filename, userId, upload_type) => {

    const params = {
        Bucket: 'employeeportalservices',
        //Key: 'uploads/BN12232/AADHAR/file1.txt'
        Key: 'uploads/' + userId + '/' + upload_type + '/' + filename
    };
    s3.deleteObject(params, function (s3Err, data) {
        if (s3Err) throw s3Err
        console.log('File deleted successfully ')
    });

};

var storage = multer.diskStorage(
    {
        destination: folder,
        filename: function (req, file, cb) {
            filename = file.originalname
            console.log("File Name " + filename)
            cb(null, file.originalname);
        }
    }
);

const upload = multer({ storage: storage })


router.post('/upoad', upload.single('FILE_NAME'), auth, async (req, res) => {
    employee = await req.user
    const type = req.query.type
    console.log("** uploading " + type)

    idProofArr = employee.IdentificationProof
    //console.log("Id Proofs :: "+idProofArr)
    let x = 0
    for (x = 0; x<idProofArr.length; x++) {
        console.log('checking '+ type +' with '+idProofArr[x].IdProofType)
        if (idProofArr[x].IdProofType.indexOf(type) > -1) {
            idProofArr[x].FileName = filename
            break;
        }
    }
    if(x === idProofArr.length){
        //this type of document was not added , adding new type
        idProofArr.push({
            "IdProofType":type,
            "FileName":filename
        })
    }
    await employee.save();

    const userId = req.user.AuthenticationDetails.UserId
    try {
        console.log("Source file location " + folder + filename)
        await uploadFile(folder + filename, userId, type)
    }
    catch (err) {
        res.status(500).send({ "success": false, "err": err })
        return
    }
    res.send({ "success": true, "filename": filename })
})


router.post('/delete', auth, async (req, res) => {
    employee = await req.user
    const type = req.query.type
    console.log("** Deleting File " + type)
    const userId = req.user.AuthenticationDetails.UserId

    idProofArr = employee.IdentificationProof
    //console.log("Id Proofs :: "+idProofArr)
    let x = 0
    for (x = 0; x<idProofArr.length; x++) {
        console.log('checking '+ type +' with '+idProofArr[x].IdProofType)
        if (idProofArr[x].IdProofType.indexOf(type) > -1) {
            //this type of id proof was uploaded 
            const filename = idProofArr[x].FileName
            try {
                await deleteFile(filename, userId, type)
                idProofArr[x].FileName = null
                await employee.save();
                res.send({ "success": true  })
                return;
            }
            catch (err) {
                res.status(500).send({ "success": false, "err": err })
                return
            }
           
        }
    }

    if(x === idProofArr.length){
        // This type of proof was not uploaded earlier
        res.status(404).send({ "success": false , "err": 'this type of id proof was not uploaded earlier '   })
    }

   
    
})

module.exports = router
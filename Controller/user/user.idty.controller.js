const express = require('express');
const auth = require('../../middleware/auth')
var multer = require("multer")
const router = express.Router();

const fs = require('fs');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const folder = 'uploads/'
//const file = 'shuvo.txt'
//const fileName = folder+file;

var filename = null;

const uploadFile = async(filePath) => {
    console.log("*** uploading file o s3 "+filePath)
    fs.readFile(filePath, (err, data) => {
        
        if (err) throw err;
        const params = {
            Bucket: 'employeeportalservices', // pass your bucket name
            Key: folder+filename, // file will be saved as testBucket/contacts.csv
            Body: JSON.stringify(data, null, 2)
        };
        s3.upload(params, function (s3Err, data) {
            if (s3Err) throw s3Err
            console.log(`File uploaded successfully at ${data.Location}`)
        });
    });
};

var storage = multer.diskStorage(
    {
        destination: folder,
        filename: function (req, file, cb) {
            //req.body is empty...
            //How could I get the new_file_name property sent from client here?
            filename = file.originalname
            cb(null, file.originalname);
        }
    }
);

var upload = multer({ storage: storage })


router.post('/upoad', auth, upload.single('FILE_NAME'), async (req, res) => {
    console.log('*** Uploading id proof for  **** '+req.user.AuthenticationDetails.UserId)
    await uploadFile(folder+filename)
    res.send({ "success": true, "filename": filename })
})


module.exports = router
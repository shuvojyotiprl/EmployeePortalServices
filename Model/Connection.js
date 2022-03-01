const mongoose = require('mongoose');


const dbUser = process.env.DB_USER
const dbPasswd = process.env.DB_PASSWD
const dbName = process.env.DB_NAME

console.log("user "+dbUser)
console.log("password "+dbPasswd)
console.log("db name  "+dbName)

const connection_url = 'mongodb+srv://' + dbUser + ':' + dbPasswd + '@cluster0-msk3d.mongodb.net/' + dbName + '?retryWrites=true&w=majority';


mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

mongoose.connect(connection_url,
    { useNewUrlParser: true,useUnifiedTopology: true }).then((con)=>{
        console.log('Successfully connected to MongoDB Server')
    }).catch((err)=>{
        console.log('Error Establishing connection to DB'+err)
    })

require('../Model/EmployeeModel')
require('../Model/ProjectDetails')

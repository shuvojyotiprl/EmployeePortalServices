const mongoose = require('mongoose');
const EmpUtilProp = require('../util/EmpUtilProperties')

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

mongoose.connect(EmpUtilProp.db_url_dev,
    { useNewUrlParser: true,useUnifiedTopology: true }).then((con)=>{
        console.log('Successfully connected to MongoDB Server')
    }).catch((err)=>{
        console.log('Error Establishing connection to DB'+err)
    })

require('../Model/EmployeeModel')

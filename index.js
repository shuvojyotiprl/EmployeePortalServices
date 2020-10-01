
const express = require("express");
var cors = require('cors')
const bodyparser = require("body-parser");
const morgan = require('morgan')

const application = express();

application.use(cors())
application.use(bodyparser.json())
application.use(
    bodyparser.urlencoded({
        extended : true
    })
);
application.use(morgan('dev'))

const UserRoute = require('../EmployeePortalServices/Controller/UserController');
application.use('/user',UserRoute)




application.listen(process.env.PORT||'3000',()=>{
    console.log('Server started at PORT ==> ');
    console.log(process.env.PORT||'3000')
})

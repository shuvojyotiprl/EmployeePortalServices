
const express = require("express");
var cors = require('cors')
const bodyparser = require("body-parser");
const morgan = require('morgan')


//const swaggerJSDoc=require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express')

const application = express();

application.use(cors())
application.use(bodyparser.json())
application.use(
    bodyparser.urlencoded({
        extended : true
    })
); 





application.use(morgan('dev'))

const UserRoute = require('./Controller/UserController');
const ProjectRoute = require('./Controller/ProjectController');

application.use('/user',UserRoute)
application.use('/projects',ProjectRoute)




application.listen(process.env.PORT||'3000',()=>{
    console.log('Server started at PORT ==> ');
    console.log(process.env.PORT||'3000')
})

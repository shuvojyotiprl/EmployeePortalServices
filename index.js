require("dotenv").config()
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

const UserRoute = require('./Controller/user/user.controller');
const ProjectRoute = require('./Controller/ProjectController');
const UserCerificationRoute = require('./Controller/user/user.certification.controller');
const UserAuthernitactionRoute = require('./Controller/user/user.auth.controller')
const UserEduRoute = require('./Controller/user/user.edu.controller')
const UserPersonalRoute = require('./Controller/user/user.personal.controller')

application.use('/user/personal',UserPersonalRoute)
application.use('/user/edu',UserEduRoute)
application.use('/user/auth',UserAuthernitactionRoute)
application.use('/user/cert', UserCerificationRoute)
application.use('/user',UserRoute)


application.use('/projects',ProjectRoute)




application.listen(process.env.PORT||'3000',()=>{
    console.log('Server started at PORT ==> ');
    console.log(process.env.PORT||'3000')
})

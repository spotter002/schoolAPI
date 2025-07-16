const express = require('express')
const router = express.Router()
const loginController = require('../controller/loginController')    
const classroomController = require('../controller/classroomController')
const teacherController = require('../controller/teacherController')
const {auth, authorizeRoles} = require('../middleware/auth')

// user routes
router.post('/register',loginController.registerAdmin)
router.post('/login', loginController.loginAdmin)
router.get('/',loginController.getUsers)
module.exports = router
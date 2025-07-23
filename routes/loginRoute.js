const express = require('express')
const router = express.Router()
const loginController = require('../controller/loginController')    
const adminDash = require('../controller/adminDash')
const {auth, authorizeRoles} = require('../middleware/auth')

// user routes
router.post('/register',loginController.registerAdmin)
router.post('/login', loginController.loginAdmin)
router.get('/',loginController.getUsers)

//dash
router.get('/dash', auth, authorizeRoles('admin'), adminDash.getDashboardData)


module.exports = router
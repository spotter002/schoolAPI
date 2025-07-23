const express = require('express')
const router = express.Router()
const loginController = require('../controller/loginController')    
const classroomController = require('../controller/classroomController')
const parentController = require('../controller/parentController')
const {auth, authorizeRoles} = require('../middleware/auth')



// classroom routes
router.post('/addParent', auth, authorizeRoles('admin'), parentController.addParent)
router.get('/', auth,parentController.getAllParents)
router.get('/:id', auth,parentController.getParentById)
router.put('/:id', auth, authorizeRoles('admin','parent'), parentController.updateParent)
router.delete('/:id', auth, authorizeRoles('admin'), parentController.deleteParent)

module.exports = router
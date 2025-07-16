const express = require('express')
const router = express.Router()
const loginController = require('../controller/loginController')    
const classroomController = require('../controller/classroomController')
const teacherController = require('../controller/teacherController')
const {auth, authorizeRoles} = require('../middleware/auth')



// classroom routes
router.post('/addClassroom', auth, authorizeRoles('admin'), classroomController.addClassroom)
router.get('/', auth,classroomController.getAllClassrooms)
router.get('/:id', auth,classroomController.getOneClassroom)
router.put('/:id', auth, authorizeRoles('admin'), classroomController.updateClassroom)
router.delete('/:id', auth, authorizeRoles('admin'), classroomController.deleteClassroom)

module.exports = router
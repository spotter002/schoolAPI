const express = require('express')
const router = express.Router()
const teacherController = require('../controller/teacherController')
const {auth, authorizeRoles} = require('../middleware/auth')


//teacher routes
router.post('/', auth, authorizeRoles('admin'), teacherController.addTeacher)
router.get('/', auth, teacherController.getAllTeachers)
router.get('/:id', auth, teacherController.getTeacherById)
router.put('/:id', auth, authorizeRoles('admin','teacher'), teacherController.updateTeacher)
router.delete('/:id', auth, authorizeRoles('admin'), teacherController.deleteTeacher)
module.exports = router
const express = require('express')
const router = express.Router()
const teacherController = require('../controller/teacherController')
const {auth, authorizeRoles} = require('../middleware/auth')


//teacher routes
router.post('/', auth, authorizeRoles('admin'), teacherController.addTeacher)
router.get('/', auth, teacherController.getAllTeachers)
router.get('/classes',auth,teacherController.getMyClasses)
router.get('/assignments',auth,teacherController.getMyAssignments)

router.put('/self', auth, authorizeRoles('teacher'), teacherController.updateTeacher)
router.delete('/:id', auth, authorizeRoles('admin'), teacherController.deleteTeacher)
router.get('/:id', auth, teacherController.getTeacherById)
router.put('/:id', auth, authorizeRoles('admin','teacher'), teacherController.updateTeacher)
module.exports = router
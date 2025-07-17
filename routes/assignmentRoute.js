const express = require('express')
const router = express.Router()
const assignmentController = require('../controller/assignmentController')
const {auth, authorizeRoles} = require('../middleware/auth')



// classroom routes
router.post('/addClassroom', auth, authorizeRoles('teacher', 'admin'), assignmentController.addAssignment)
router.get('/', auth,assignmentController.getAllAssignments)
//router.get('/:id', auth,classroomController.getOneClassroom)
//router.put('/:id', auth, authorizeRoles('admin'), classroomController.updateClassroom)
//router.delete('/:id', auth, authorizeRoles('admin'), classroomController.deleteClassroom)

module.exports = router
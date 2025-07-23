const express = require('express')
const router = express.Router()
const assignmentController = require('../controller/assignmentController')
const {auth, authorizeRoles} = require('../middleware/auth')



// classroom routes
router.get('/',auth,assignmentController.getAllAssignments)
router.post('/addAssignment', auth, authorizeRoles('teacher'), assignmentController.addAssignment)

router.get('/:id', auth, assignmentController.getAssignmentById)
router.put('/:id', auth, authorizeRoles('teacher'), assignmentController.updateAssignment)
router.delete('/:id', auth, authorizeRoles('teacher'), assignmentController.deleteAssignment)

module.exports = router
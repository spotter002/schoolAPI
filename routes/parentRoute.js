const express = require('express')
const router = express.Router()
const parentDash = require('../controller/parentDash.js')
const parentController = require('../controller/parentController')
const {auth, authorizeRoles} = require('../middleware/auth')



// classroom routes
router.get('/dash/:id', auth, authorizeRoles('parent'), parentDash.getClasssAssignments)
router.get('/dash', auth, authorizeRoles('parent'), parentDash.getchildren)
router.post('/addParent', auth, authorizeRoles('admin'), parentController.addParent)
router.get('/', auth,parentController.getAllParents)
router.get('/:id', auth,parentController.getParentById)
router.put('/:id', auth, authorizeRoles('admin','parent'), parentController.updateParent)
router.delete('/:id', auth, authorizeRoles('admin'), parentController.deleteParent)


module.exports = router
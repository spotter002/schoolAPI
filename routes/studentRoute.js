const express = require('express')
const router = express.Router()
const studentController = require('../controller/studentController')
const {auth, authorizeRoles} = require('../middleware/auth')
const multer = require('multer');
const { updateStudent } = require('../controllers/studentController');
const path = require('path');


// classroom routes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/students'); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/addStudent', auth, authorizeRoles('admin'), studentController.uploadStudentPhoto, studentController.addStudent)
router.get('/', auth,studentController.getAllStudents)
router.get('/:id', auth,studentController.getStudentById)
router.put('/:id', auth, authorizeRoles('admin'), studentController.updateStudent)
router.delete('/:id', auth, authorizeRoles('admin'), studentController.deleteStudent)
router.put('/:id', upload.single('photo'), updateStudent);
module.exports = router

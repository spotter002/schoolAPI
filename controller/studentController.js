//database
const {Student , Classroom, Parent}=require('../model/schooldb')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
//file location folder
const upload = multer({dest: 'uploads/'})
exports.uploadStudentPhoto = upload.single('photo')
exports.addStudent = async (req, res) => {
    try {
        //destructure
        const{name,dateOfBirth,gender,admissionNumber,parentNationalId,classroomID}=req.body
        //check if parent exists
        const existParent = await Parent.findOne({nationalId:parentNationalId})
        if(!existParent){
            return res.status(400).json({message:"Parent with provided ID does not exist"})
        }
        const existStudent = await Student.findOne({admissionNumber})
        //check if the admisssion is already taken
        if(existStudent){
            return res.status(400).json({message:"Admission Number already exists"})
        }
        //check if classroom exists
        const existClassroom = await Classroom.findById(classroomID)
        if(!existClassroom){
            return res.status(400).json({message:"Classroom does not exist"})
        }
        //prep the student photo
        let photo = null
        if(req.file){
            const ext = path.extname(req.file.originalname)
            const newFilename = Date.now() + ext
            const newPath = path.join('uploads', newFilename)
            fs.renameSync(req.file.path, newPath)
            photo = newPath.replace(/\\/g, '/')
        }
        // create Student
        const newStudent = new Student({
            name,
            dateOfBirth,
            gender,
            admissionNumber,
            classroom: classroomID,
            parent: existParent._id,
            photo
        })
        const savedStudent = await newStudent.save()
        // adding a student to classroom using the addToSet to avoid duplication
        await Classroom.findByIdAndUpdate(classroomID,{$addToSet:{students:savedStudent._id}})
        res.status(201).json({ message: 'Student created successfully', student: savedStudent })

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message })        
    }
}

//get all students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find()
        .populate('classroom','name gradeLevel classYear')
        .populate('parent','name email phone')
        res.status(200).json(students)
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message })
    }
}

// get student by id
exports.getStudentById = async (req, res) => {
    try {
        const studentID = req.params.id
        const student = await Student.findById(studentID)
        .populate('classroom','name gradeLevel classYear')
        .populate('parent','name email phone')
        if(!student){
            return res.status(400).json({message:"Student does not exist"})
            }
        res.status(200).json(student)
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message })
    }
 }

// UPDATE student with FormData support
exports.updateStudent = async (req, res) => {
  try {
    const studentID = req.params.id;

    // Validate classroom
    let classroom = null;
    if (req.body.classroomID) {
      classroom = await Classroom.findById(req.body.classroomID);
      if (!classroom) {
        return res.status(404).json({ message: 'Classroom not found' });
      }
    }

    // Validate parent by National ID
    let parent = null;
    if (req.body.parentNationalId) {
      parent = await Parent.findOne({ nationalId: req.body.parentNationalId });
      if (!parent) {
        return res.status(404).json({ message: 'Parent not found' });
      }
    }

    // Prepare updated fields from the form
    const updatedFields = {
      name: req.body.name,
      admissionNumber: req.body.admissionNumber,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      classroom: classroom ? classroom._id : undefined,
      parent: parent ? parent._id : undefined,
    };

    // If new photo uploaded, add its path
    if (req.file) {
      updatedFields.photo = req.file.path;
    }

    // Remove undefined fields so they don’t overwrite existing data
    Object.keys(updatedFields).forEach(
      (key) => updatedFields[key] === undefined && delete updatedFields[key]
    );

    // Update student in DB
    const updatedStudent = await Student.findByIdAndUpdate(
      studentID,
      updatedFields,
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      message: 'Student updated successfully',
      student: updatedStudent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};
 //delete student
 exports.deleteStudent = async (req, res) => {
    try {
        const studentID = req.params.id
        const deletedStudent = await Student.findByIdAndDelete(studentID)
        if (!deletedStudent) {
            return res.status(404).json({ message: 'Student not found' })
        }

         // remove photo from storage
        if (deletedStudent.photo && fs.existsSync(deletedStudent.photo)) {
            fs.unlinkSync(deletedStudent.photo)
        }
        
        //remove student from classroom
        await Classroom.updateMany(
            { students: deletedStudent._id },
             { $pull: { students: deletedStudent._id } })
        res.status(200).json({ message: 'Student deleted successfully', student: deletedStudent })
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message })
    }
}

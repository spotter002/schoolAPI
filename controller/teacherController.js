const { Teacher , User , Classroom} = require('../model/schooldb')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose');

// add teacher
exports.addTeacher = async (req, res) => {
   try {
    // check if teacher exists
    const {email}=req.body
     const existUserEmail = await User.findOne({email})
    if(existUserEmail){
        return res.status(400).json({message: 'Teacher already exists'})
    }

    const existEmail = await Teacher.findOne({email})
    if(existEmail){
        return res.status(400).json({message: 'Teacher already exists'})
    }
        // create new teacher
        const newTeacher = new Teacher(req.body)
        await newTeacher.save()

        // create a corresponding user document for the teacher
        // default password
        const defaultPassword = 'password'
        const password = await bcrypt.hash(defaultPassword, 10)
        const newUser = new User({
            name: newTeacher.name,
            email: newTeacher.email,
            password,
            role: 'teacher',
            teacher: newTeacher._id
        })
        await newUser.save()
        res.status(201).json({message: 'Teacher Registered successfully', teacher: newTeacher, user: newUser})
    } catch (error) {
        res.status(500).json({message: 'Internal server error', error: error.message})
    }
}

// get all teachers
exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find()
        res.status(200).json(teachers)
    } catch (error) {
        res.status(500).json({message: 'Internal server error', error: error.message})
    }
}

// get teacher by id
exports.getTeacherById = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id)
        if (!teacher) {
            return res.status(404).json({message: 'Teacher not found'})
        }
        res.status(200).json(teacher)
    } catch (error) {
        res.status(500).json({message: 'Internal server error', error: error.message})
    }
}

// update teacher
exports.updateTeacher = async (req, res) => {
  try {
    const requestingUser = req.user
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    const linkedUser = await User.findOne({ teacher: req.params.id });
    if (!linkedUser) {
      return res.status(404).json({ message: 'Linked user not found' });
    }
    const isAdmin = requestingUser.role === 'admin';
    const isSelf = linkedUser._id.toString() === requestingUser.userId.toString()

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own profile.' });
    }
    const updatedTeacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true })
    const { name, email, password } = req.body;
    if (name) linkedUser.name = name;
    if (email) linkedUser.email = email;
    if (password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          message: 'Password must be at least 8 characters and include uppercase, lowercase, and a number.'
        });
      }
      const salt = await bcrypt.genSalt(10);
      linkedUser.password = await bcrypt.hash(password, salt);
    }
    await linkedUser.save();
    return res.status(200).json({
      message: 'Teacher and user profile updated successfully',
      teacher: updatedTeacher
    });
    } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
// delete teacher
exports.deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndDelete(req.params.id)
        if (!teacher) {
            return res.status(404).json({message: 'Teacher not found'})
            }
        res.status(200).json({message: 'Teacher deleted successfully', teacher: teacher})
    } catch (error) {
        res.status(500).json({message: 'Internal server error', error: error.message})
    }
}
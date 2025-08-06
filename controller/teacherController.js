const { Teacher, User, Classroom, Assignment } = require('../model/schooldb')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose');

// add teacher
exports.addTeacher = async (req, res) => {
    try {
        // check if teacher exists
        const { email } = req.body
        const existUserEmail = await User.findOne({ email })
        if (existUserEmail) {
            return res.status(400).json({ message: 'Teacher already exists' })
        }

        const existEmail = await Teacher.findOne({ email })
        if (existEmail) {
            return res.status(400).json({ message: 'Teacher already exists' })
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
        res.status(201).json({ message: 'Teacher Registered successfully', teacher: newTeacher, user: newUser })
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message })
    }
}

// get all teachers
exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find()
        res.status(200).json(teachers)
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message })
    }
}

// get teacher by id
exports.getTeacherById = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id)
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' })
        }
        res.status(200).json(teacher)
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message })
    }
}

//update teacher
exports.updateTeacher = async (req, res) => {
    try {
        const requestingUser = req.user;
        const { role, userId } = requestingUser;
        let targetTeacherId = req.params.id;
        // If teacher is updating themselves, get their own teacher ID
        if (role === 'teacher') {
            const linkedUser = await User.findById(userId);
            if (!linkedUser || !linkedUser.teacher) {
                return res.status(404).json({ message: 'Linked teacher not found' });
            }
            targetTeacherId = linkedUser.teacher; // Use the teacher ID linked to the user+
        }
        // Step 1: Get the teacher
        const teacher = await Teacher.findById(targetTeacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        // Step 2: Get the linked user
        const linkedUser = await User.findOne({ teacher: targetTeacherId });
        if (!linkedUser) {
            return res.status(404).json({ message: 'Linked user not found' });
        }
        const isAdmin = role === 'admin';
        const isSelf = linkedUser._id.toString() === userId.toString();
        // Step 3: Update Teacher info
        const { name, email, password, userRole } = req.body;
        if (name) {
            teacher.name = name;
            linkedUser.name = name;
        }
        if (email) {
            teacher.email = email;
            linkedUser.email = email;
        }
        if (userRole) {
            if(!isAdmin){
                return res.status(403).json({ message: 'Only admins can update teacher roles.' });
            }
            teacher.role = userRole;
            linkedUser.role = userRole;
        }
        // Step 4: Password logic
        if (password) {
            if (!isSelf) {
                return res.status(403).json({ message: 'Admins cannot update other users\' passwords.' });
            }
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).json({
                    message: 'Password must be at least 8 characters and include uppercase, lowercase, and a number.'
                });
            }
            const salt = await bcrypt.genSalt(10);
            linkedUser.password = await bcrypt.hash(password, salt);
        }
        // Save both
        await teacher.save();
        await linkedUser.save();
        return res.status(200).json({
            message: 'Teacher and user profile updated successfully',
            teacher
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
// delete teacher
exports.deleteTeacher = async (req, res) => {
    try {
        const teacherId = req.params.id;

        // Step 1: Delete the teacher
        const teacher = await Teacher.findByIdAndDelete(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Step 2: Delete the associated user
        const user = await User.findOne({ teacher: teacherId });
        if (user) {
            await User.findByIdAndDelete(user._id);
        }

        // Step 3: Remove teacher reference from all classes
        const updatedClasses = await Classroom.updateMany(
            { teacher: teacherId }, // adjust field name if it's different
            { $unset: { teacher: "" } } // or use $set: { teacher: null } depending on your schema
        );

        res.status(200).json({ 
            message: 'Teacher deleted successfully, user removed, and teacher unassigned from classes',
            deletedTeacher: teacher,
            deletedUser: user || null,
            updatedClassesCount: updatedClasses.modifiedCount
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'Internal server error', 
            error: error.message 
        });
    }
};

// get teacher classes
exports.getMyClasses= async (req, res) => {
    try {
        // Check if the user is a teacher
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }
        // Find the teacher by ID
        const user = await User.findById(req.user.userId).populate('teacher');
        if (!user || !user.teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        // Find all classrooms where the teacher is assigned
        const classrooms = await Classroom.find({ teacher: user.teacher._id }).populate('students');
        res.status(200).json(classrooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// get teacher assignments
exports.getMyAssignments = async (req, res) => {
    try {
        // Check if the user is a teacher
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }
        // Find the teacher by ID
        const user = await User.findById(req.user.userId).populate('teacher','name email');
        if (!user || !user.teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        // Find all classrooms where the teacher is assigned
        const assignments = await Assignment.find({ postedBy: user.teacher._id }).populate('postedBy')
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Define the user schema 
const userSchema = new Schema({
    name:{type: String},
    email:{type: String, unique: true, required: true},
    password:{type: String, required: true},
    isActive:{type: Boolean, default: true},
    role:{type: String, enum: ['admin', 'teacher', 'parent'], required: true},
    teacher:{type:mongoose.Schema.Types.ObjectId, ref: 'Teacher',default: null},
    parent:{type:mongoose.Schema.Types.ObjectId, ref: 'Parent',default: null},
},{timestamps: true})

// Define the teacher schema
const teacherSchema = new Schema({
    name:{type: String, required: true},
    email:{type: String},
    phone:{type: String},
    subject:{type: String},
},{timestamps: true})

// Define the parent schema
const parentSchema = new Schema({
    name:{type: String, required: true},
    email:{type: String},
    phone:{type: String , required: true},
    nationalId:{type: String, required: true , unique: true},
    address:{type: String},
    children:[{type: mongoose.Schema.Types.ObjectId, ref: 'Student'}]
},{timestamps: true})

// Define the classroom schema
const classroomSchema = new Schema({
    name:{type: String, required: true},
    gradeLevel:{type: String},
    classYear:{type: String},
    teacher:{type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null},
    students:[{type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null}],
},{timestamps: true})

// Define the student schema
const studentSchema = new Schema({
    name:{type: String, required: true},
    dateOfBirth:{type: Date, required: true},
    gender:{type: String},
    photo:{type: String},
    admissionNumber:{type: String, unique: true },
    classroom:{type: mongoose.Schema.Types.ObjectId, ref: 'Classroom'},
    parent:{type: mongoose.Schema.Types.ObjectId, ref: 'Parent',}
},{timestamps: true})

// Define the assignment schema
const assignmentSchema = new Schema({
    title:{type: String, required: true},
    description:{type: String},
    dueDate:{type: Date},
    classroom:{type: mongoose.Schema.Types.ObjectId, ref: 'Classroom'},
    postedBy:{type: mongoose.Schema.Types.ObjectId, ref: 'Teacher'},
},{timestamps: true})

// prepare the model exports
const User = mongoose.model('User', userSchema)
const Teacher = mongoose.model('Teacher', teacherSchema)
const Parent = mongoose.model('Parent', parentSchema)
const Classroom = mongoose.model('Classroom', classroomSchema)
const Student = mongoose.model('Student', studentSchema)
const Assignment = mongoose.model('Assignment', assignmentSchema)

// Export the models
module.exports = {User,Teacher,Parent,Classroom,Student,Assignment}
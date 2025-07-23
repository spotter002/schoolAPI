// Entry File
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

// middlewares
const app = express()
app.use(express.json())
app.use(cors())

// static files accessibility
app.use('/uploads', express.static('uploads'))

// Routes
//user route
const userAuth = require('./routes/loginRoute')
app.use('/user/Auth', userAuth)

//classroom route
const classroom = require('./routes/classRoute')
app.use('/class', classroom)

//assignment route
const assignment = require('./routes/assignmentRoute')
app.use('/assignment', assignment)

//teacher route
const teacher = require('./routes/teacherRoute')
app.use('/teacher', teacher)

//parent route
const parent = require('./routes/parentRoute')
app.use('/parent', parent)

//student route
const student = require('./routes/studentRoute')
app.use('/student', student)

// connect to the database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err))


const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
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

//teacher route
const teacher = require('./routes/teacherRoute')
app.use('/teacher', teacher)

// connect to the database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err))


const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
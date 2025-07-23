const {User} = require('../model/schooldb')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// register user logic
exports.registerAdmin = async (req, res) => {
    const {name, email, password, secretKey} = req.body
    try {
        // Check if the secret key matches
        if (secretKey !== process.env.secretKey) {
            return res.status(403).json({message: 'Unauthorized Account Creation'})
        }

        // Check if user already exists
        const existingUser = await User.findOne({email})
        if (existingUser) {
            return res.status(400).json({message: 'User already exists'})
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            isActive: true,
            teacher: null,
            parent: null,
            role: 'admin'})

        // Save the user to the database
        await newUser.save()
        
        res.status(201).json({message: 'Admin registered successfully',newUser})
    } catch (error) {
        console.error('Error registering admin:', error)
        res.status(500).json({message: 'Internal server error'})
    }
}


// login user logic
exports.loginAdmin = async (req, res) => {
    const {email, password} = req.body
    try {
        // Find user by email
        const user = await User.findOne({email})
        if (!user) {
            return res.status(404).json({message: 'Invalid Credentials... Please try again'})
        }
        if (!user.isActive) {
            return res.status(403).json({message: 'Account is deactivated!!!'})
        }

        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({message: 'Invalid Credentials... Please try again'})
        }

        // Generate JWT token
        const token = jwt.sign({userId: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '24h'})

        // Return user data excluding password
        res.status(200).json({message: 'Login successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            },
            token: token
        })
    } catch (error) {
        console.error('Error logging in:', error)
        res.status(500).json({message: 'Internal server error'})
    }
}

// get users
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find()
        res.status(200).json({message: 'Users fetched successfully', users: users})
    } catch (error) {
        res.status(500).json({message: 'Internal server error', error: error.message})
    }
}


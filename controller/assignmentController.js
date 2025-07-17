const {Assignment , User , Classroom} = require('../model/schooldb')
// get all assignments (aDMIN View)
//includes classromoms and teacher information

exports.getAllAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find()
        .populate('classroom','name gradeLevel classYear')
        .populate('postedBy','name email phone')
        res.status(200).json(assignments)
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message })
    }
}
// add assignments only for teachers
// validate user and  classroom exists
exports.addAssignment = async (req, res) => {
    try {
        //get logged i user
        const userId  = req.user.userId
        // fetch the user and populate teacher 
        const user = await User.findById(userId).populate('teacher')
        //block non teachers
        if(!user || !user.teacher){
            return res.status(403).json({message: 'Access denied'})
        }
        //get classroom id
        const {classroom:classroomId} = req.body
        //fetch classroom
        const classroom = await Classroom.findById(classroomId)
        if(!classroom){
            return res.status(404).json({message: 'Classroom not found'})
        } 
        // prep the data 
        const assignmentData = {
            ...req.body,
            postedBy: user.teacher._id
        }
        // save the assignment
        const newAssignment = new Assignment(assignmentData)
        await newAssignment.save()
        res.status(201).json({message: 'Assignment created successfully', assignment: newAssignment})
        }
    catch (error) {
            res.status(500).json({ message: 'Internal server error', error: error.message })
            }
    }
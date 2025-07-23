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
            return res.status(403).json({message: 'Access denied. Only teachers can add assignments'})
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
        res.status(201).json({message: 'Assignment Posted successfully', assignment: newAssignment})
        }
    catch (error) {
            res.status(500).json({ message: 'Internal server error', error: error.message })
            }
    }

    //get one assignment
    exports.getAssignmentById = async (req, res) => {
        try {
            const assignment = await Assignment.findById(req.params.id)
            .populate('classroom')
            .populate('postedBy','name email phone')
            if(!assignment){
                return res.status(404).json({message: 'Assignment not found'})
            }
            res.status(200).json(assignment)
            }
    
    catch (error) {
            res.status(500).json({ message: 'Internal server error', error: error.message })
            }
    }

    // upate assignment
    exports.updateAssignment = async (req, res) => {
        try {
            const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true })
            if(!assignment){
                return res.status(404).json({message: 'Assignment not found'})
            }
            res.status(200).json({message: 'Assignment updated successfully', assignment: assignment})
            }
    
    catch (error) {
            res.status(500).json({ message: 'Internal server error', error: error.message })
            }
    }

    //delete assignment
    exports.deleteAssignment = async (req, res) => {
        try {
            const userId  = req.user.userId
            const assignment = await Assignment.findByIdAndDelete(req.params.id)
            if(!assignment){
                return res.status(404).json({message: 'Assignment not found'})
                }
                res.status(200).json({message: 'Assignment deleted successfully'})
                }
    
    catch (error) {
            res.status(500).json({ message: 'Internal server error', error: error.message })
            }
    }
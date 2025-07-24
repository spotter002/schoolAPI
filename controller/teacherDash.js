const{ User , Assignment , Classroom} = require('../model/schooldb')
//teacher dash 
exports.getTeacherDash = async (req, res) => {
    try {
        // the loggged in user who is a teacher
        const userId=req.user.userId
        //fetch the teacher object
        const user = await User.findById(userId).populate('teacher')
        if(!user || !user.teacher){
            return res.status(404).json({message:'Teacher not found'})
        }
        //extract the teacher id
        const teacherId = user.teacher._id
        
        //agggregate the data to get class count and student total
        const classStats = await Classroom.aggregate([
            {$match: {teacher: teacherId}},
            {$group: {_id: null, classCount: {$sum: 1}, studentCount:{$sum : {$size: '$students'}} }} //{$sum: '$students.length'}
        ])
        //count all Assignments
        const assignmentCount = await Assignment.countDocuments({postedBy: teacherId})
        res.status(200).json({classStats, assignmentCount})
        //prep results
        const result = {
            classCount: classStats[0]?.classCount || 0,
            studentCount: classStats[0].studentCount ,
            assignmentCount
        }
       
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


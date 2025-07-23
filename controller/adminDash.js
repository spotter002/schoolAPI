const {Student, Classroom, Parent, Teacher, User} = require("../model/schooldb")
// get dashboard data
exports.getDashboardData = async (req, res) => {
    try {
        // we run all count operations parallel for better perfomance
        const [studentCount, classroomCount, parentCount, teacherCount, userCount] = await Promise.all([
            Student.countDocuments(),
            Classroom.countDocuments(),
            Parent.countDocuments(),
            Teacher.countDocuments(),
            User.countDocuments({isActive: true})
        ])

        // get the most reent student to be registered sorted from the latest
        const recentStudent = await Student.find().sort({createdAt: -1}).limit(5)
        //get recent teacher
        const recentTeacher = await Teacher.find().sort({createdAt: -1}).limit(5)

        //return all the data
        res.status(200).json({
            studentCount,
            classroomCount,
            parentCount,
            teacherCount,
            userCount,
            recentStudent,
            recentTeacher
        })

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message })
    }
}
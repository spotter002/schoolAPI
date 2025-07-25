const {User , Parent, Classroom, Student, Assignment} = require('../model/schooldb')

//get the children belonging to a parent
exports.getchildren = async (req, res) => {
    try {
        //get the parent id from the token
        const userId = req.user.userId
        const user = await User.findById(userId).populate('parent')     
        //extract the parent id
        const parent = user.parent
        //fetch the children
        const children = await Student.find(parent).populate('classroom')
        res.status(200).json({parent,children})
    } catch (error) {
        res.status(500).json({message: 'Error fetching children'})
    }
    }

    //get students assignments
exports.getClasssAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({classroom: req.params.id})
        .populate('classroom')
        .populate('postedBy')
        .sort({dueDate: -1
            
        })
        res.status(200).json(assignments)
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message })
    }
}
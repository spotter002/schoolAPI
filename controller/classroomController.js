const {Classroom, Teacher} = require('../model/schooldb')
// create a classroom
exports.addClassroom=async(req,res)=>{
    try {
        // RECEIVE FROM CLIENT  
        const newClassroom = req.body
        const exist = await Classroom.findOne({name: newClassroom.name , gradeLevel: newClassroom.gradeLevel})
        if(exist){
            return res.status(400).json({message: 'Classroom already exists'})
        }
        let savedClassroom
        savedClassroom = new Classroom(newClassroom)
        console.log(newClassroom)
        await savedClassroom.save()
        res.status(201).json({message: 'Classroom created successfully', classroom: savedClassroom})
    } catch (error) {
        res.status(500).json({message: 'Internal server error', error: error.message})
    }
}
// get all 
exports.getAllClassrooms=async(req,res)=>{
    try {
        const classrooms = await Classroom.find()
        .populate('students','name admissionNumber')
        .populate('teacher','name email phone')
        res.status(200).json({message: 'Classrooms fetched successfully', classrooms: classrooms})
    } catch (error) {
        res.status(500).json({message: 'Internal server error', error: error.message})
    }
}

// get one class
exports.getOneClassroom=async(req,res)=>{
    try {
        const classroom = await Classroom.findById(req.params.id)
        .populate('students','name admissionNumber')
        .populate('teacher','name email phone')
        if(!classroom){
            return res.status(404).json({message: 'Classroom not found'})
        }
        res.status(200).json({message: 'Classroom fetched successfully', classroom: classroom})
    } catch (error) {
        res.status(500).json({message: 'Internal server error', error: error.message})
    }
}

// update classroom
exports.updateClassroom = async (req, res) => {
  try {
    const { teacher } = req.body;

    // ✅ Check if teacher exists (only if teacher is in req.body)
    if (teacher) {
      const teacherExists = await Teacher.findById(teacher);
      if (!teacherExists) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
    }

    // 🔄 Update classroom
    const classroom = await Classroom.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('teacher'); // Optional: populate to get teacher details

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    return res.status(200).json({
      message: 'Classroom updated successfully',
      classroom,
    });
  } catch (error) {
    console.error('Error updating classroom:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }
};


// delete classroom
exports.deleteClassroom=async(req,res)=>{
    try {
        const classroom = await Classroom.findByIdAndDelete(req.params.id)
        if(!classroom){
            return res.status(404).json({message: 'Classroom not found'})
        }
        res.status(200).json({message: 'Classroom deleted successfully', classroom: classroom})
    } catch (error) {
        res.status(500).json({message: 'Internal server error', error: error.message})
    }
}
const {Parent, User} = require("../model/schooldb")
const bcrypt = require('bcrypt')

// add parent
exports.addParent = async (req, res) => {
    try {
        //destructure variable to check if the parent exixts
        const{email,nationalId, name} = req.body
        //check using email
        const existParentEmail = await Parent.findOne({email})
        if(existParentEmail){
            return res.status(400).json({message:"Parent with this email already exists"})
        }
        //check using their ID
        const existParentId = await Parent.findOne({nationalId})
        if(existParentId){
            return res.status(400).json({message:"Parent with this ID already exists"})
        }
        //if every check id good , create new parent
        const newParent = new Parent(req.body)
        const savedParent = await newParent.save()
        //create a corresponding user document for the parent
        const defaultPassword = 'password'
        const password = await bcrypt.hash(defaultPassword, 10)
        const newUser = new User({
            name,
            email,
            password,
            role:'parent',
            parent:savedParent._id
        })
        await newUser.save()
        res.status(201).json({message:"Parent and user created successfully", parent:savedParent})
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}
//get all parents
exports.getAllParents = async (req, res) => {
    try {
        const parents = await Parent.find()
        res.status(200).json(parents)
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

// get parent by id
exports.getParentById = async (req, res) => {
    try {
        const parentId = req.params.id
        const parent = await Parent.findOne({nationalId:parentId})
        if(!parent){
            return res.status(404).json({message:"Parent not found"})
        }
        res.status(200).json(parent)
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

// update parent
exports.updateParent = async (req,res)=>{
    try {
        const parentId = req.params.id
        const updatedParent = await Parent.findByIdAndUpdate(parentId, req.body, {new:true})
        if(!updatedParent){
            return res.status(404).json({message:"Parent not found"})
        }
        res.status(200).json({message:"Parent updated successfully", parent:updatedParent})
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

// delete parent 
exports.deleteParent = async (req,res)=>{
    try {
        const parentId = req.params.id
        const deletedParent = await Parent.findByIdAndDelete(parentId)
        if(!deletedParent){
            return res.status(404).json({message:"Parent not found"})
        }
         // delete the corresponding user document
        await User.findOneAndDelete({parent:parentId})
        res.status(200).json({message:"Parent deleted successfully", parent:deletedParent})
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

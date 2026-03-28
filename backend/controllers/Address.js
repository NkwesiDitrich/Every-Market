const Address = require("../models/Address")

exports.create=async(req,res)=>{
    try {
        const userId = req.user?._id
        const created=new Address({ ...req.body, user: userId })
        await created.save()
        res.status(201).json(created)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Error adding address, please trying again later'})
    }
}

exports.getByUserId = async (req, res) => {
    try {
        const {id}=req.params
        const results=await Address.find({user:id})
        res.status(200).json(results)
    
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error fetching addresses, please try again later'})
    }
};

exports.updateById=async(req,res)=>{
    try {
        const {id}=req.params
        const existing = await Address.findById(id)
        if(!existing){
            return res.status(404).json({message:"Address not found"})
        }
        if(!req.user?.isAdmin && String(existing.user) !== String(req.user?._id)){
            return res.status(403).json({message:"Forbidden"})
        }
        const { user, ...safeBody } = req.body || {}
        const updated=await Address.findByIdAndUpdate(id,safeBody,{new:true})
        res.status(200).json(updated)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error updating address, please try again later'})
    }
}

exports.deleteById=async(req,res)=>{
    try {
        const {id}=req.params
        const existing = await Address.findById(id)
        if(!existing){
            return res.status(404).json({message:"Address not found"})
        }
        if(!req.user?.isAdmin && String(existing.user) !== String(req.user?._id)){
            return res.status(403).json({message:"Forbidden"})
        }
        const deleted=await Address.findByIdAndDelete(id)
        res.status(200).json(deleted)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error deleting address, please try again later'})
    }
}



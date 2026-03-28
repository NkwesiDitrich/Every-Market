const Cart=require('../models/Cart')
const notificationController = require("./Notification")
const crypto = require("crypto")

exports.create=async(req,res)=>{
    try {
        const userId = req.user?._id
        const { product: productId, quantity } = req.body

        // Stock Validation
        const Product = require("../models/Product")
        const productDoc = await Product.findById(productId).lean().exec()
        if (!productDoc) {
            return res.status(404).json({ message: "Product not found" })
        }
        if (productDoc.stockQuantity < (quantity || 1)) {
            return res.status(400).json({ message: `Only ${productDoc.stockQuantity} items available` })
        }

        const created=await new Cart({ ...req.body, user: userId }).populate({path:"product",populate:{path:"brand"}});
        await created.save()
        
        // Notify User
        try {
          await notificationController.createNotification({
            title: "Item Added to Cart",
            body: `"${created.product?.title || "Product"}" has been added to your cart.`,
            recipient: userId,
            type: "product",
            urgancy: "low",
            link: "/cart",
            createdBy: userId
          });
        } catch (err) {
          console.log("Cart notification error:", err)
        }

        res.status(201).json(created)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Error adding product to cart, please trying again later'})
    }
}

exports.getByUserId=async(req,res)=>{
    try {
        const {id}=req.params
        const result = await Cart.find({ user: id }).populate({path:"product",populate:{path:"brand"}});

        res.status(200).json(result)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Error fetching cart items, please trying again later'})
    }
}

exports.updateById=async(req,res)=>{
    try {
        const {id}=req.params
        const existing = await Cart.findById(id)
        if(!existing){
            return res.status(404).json({message:"Cart item not found"})
        }
        if(!req.user?.isAdmin && String(existing.user) !== String(req.user?._id)){
            return res.status(403).json({message:"Forbidden"})
        }
        // Do not allow changing ownership or product
        const { user, product, ...safeBody } = req.body || {}

        if (safeBody.quantity !== undefined) {
          const Product = require("../models/Product")
          const productDoc = await Product.findById(existing.product).lean().exec()
          if (productDoc && productDoc.stockQuantity < safeBody.quantity) {
              return res.status(400).json({ message: `Only ${productDoc.stockQuantity} items available` })
          }
        }

        const updated=await Cart.findByIdAndUpdate(id,safeBody,{new:true}).populate({path:"product",populate:{path:"brand"}});
        res.status(200).json(updated)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Error updating cart items, please trying again later'})
    }
}

exports.deleteById=async(req,res)=>{
    try {
        const {id}=req.params
        const existing = await Cart.findById(id)
        if(!existing){
            return res.status(404).json({message:"Cart item not found"})
        }
        if(!req.user?.isAdmin && String(existing.user) !== String(req.user?._id)){
            return res.status(403).json({message:"Forbidden"})
        }
        const deleted=await Cart.findByIdAndDelete(id)

        // Notify User
        try {
          await notificationController.createNotification({
            title: "Item Removed from Cart",
            body: `An item has been removed from your cart.`,
            recipient: req.user?._id || existing.user,
            type: "product",
            urgancy: "low",
            link: "/cart",
            createdBy: req.user?._id
          });
        } catch (err) {
          console.log("Cart removal notification error:", err)
        }

        res.status(200).json(deleted)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Error deleting cart item, please trying again later'})
    }
}

exports.deleteByUserId=async(req,res)=>{

    try {
        const {id}=req.params
        await Cart.deleteMany({user:id})
        res.sendStatus(204)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Some Error occured while resetting your cart"})
    }

}

exports.generateShareableId = async (req, res) => {
    try {
        const userId = req.user._id
        const shareableId = crypto.randomBytes(16).toString("hex")
        await Cart.updateMany({ user: userId }, { shareableId })
        res.status(200).json({ shareableId })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error generating shareable link" })
    }
}

exports.getSharedCart = async (req, res) => {
    try {
        const { shareableId } = req.params
        const items = await Cart.find({ shareableId }).populate({ path: "product", populate: { path: "brand" } })
        res.status(200).json(items)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error fetching shared cart" })
    }
}
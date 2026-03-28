const express=require('express')
const cartController=require('../controllers/Cart')
const router=express.Router()
const { verifyToken } = require('../middleware/VerifyToken')
const { requireSelfOrAdmin } = require('../middleware/Authz')
const { validateBody } = require("../middleware/Validate")
const { schemas } = require("../validation/schemas")

router
    .post("/",verifyToken,validateBody(schemas.cart.create),cartController.create)
    .get("/user/:id",verifyToken,requireSelfOrAdmin,cartController.getByUserId)
    .patch("/:id",verifyToken,validateBody(schemas.cart.update),cartController.updateById)
    .delete("/:id",verifyToken,cartController.deleteById)
    .delete("/user/:id",verifyToken,requireSelfOrAdmin,cartController.deleteByUserId)
    .post("/generate-shareable-id", verifyToken, cartController.generateShareableId)
    .get("/shared/:shareableId", cartController.getSharedCart)

module.exports=router
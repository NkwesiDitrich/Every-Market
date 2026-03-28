const express=require('express')
const addressController=require("../controllers/Address")
const router=express.Router()
const { verifyToken } = require("../middleware/VerifyToken")
const { requireSelfOrAdmin } = require("../middleware/Authz")
const { validateBody } = require("../middleware/Validate")
const { schemas } = require("../validation/schemas")

router
    .post("/",verifyToken,validateBody(schemas.address.create),addressController.create)
    .get("/user/:id",verifyToken,requireSelfOrAdmin,addressController.getByUserId)
    .patch('/:id',verifyToken,validateBody(schemas.address.update),addressController.updateById)
    .delete('/:id',verifyToken,addressController.deleteById)

module.exports=router
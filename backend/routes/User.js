const express=require("express")
const userController=require("../controllers/User")
const router=express.Router()
const { verifyToken } = require("../middleware/VerifyToken")
const { requireSelfOrAdmin } = require("../middleware/Authz")
const { validateBody } = require("../middleware/Validate")
const { schemas } = require("../validation/schemas")

router
    .get("/:id",verifyToken,requireSelfOrAdmin,userController.getById)
    .patch("/:id",verifyToken,requireSelfOrAdmin,validateBody(schemas.user.update),userController.updateById)

module.exports=router
const express=require('express')
const orderController=require("../controllers/Order")
const router=express.Router()
const { verifyToken } = require("../middleware/VerifyToken")
const { requireAdmin, requireSelfOrAdmin } = require("../middleware/Authz")
const { validateBody } = require("../middleware/Validate")
const { schemas } = require("../validation/schemas")


router
    .post("/",verifyToken,validateBody(schemas.order.create),orderController.create)
    .post("/guest",validateBody(schemas.order.guestCreate),orderController.createGuest)
    .get("/",verifyToken,requireAdmin,orderController.getAll)
    .get("/user/:id",verifyToken,requireSelfOrAdmin,orderController.getByUserId)
    .get("/:id",verifyToken,orderController.getById)
    .patch("/:id",verifyToken,validateBody(schemas.order.update),orderController.updateById)
    .get("/admin/stale-orders", verifyToken, requireAdmin, orderController.getStaleOrders)
    .get("/tracking/:id", verifyToken, orderController.getTrackingInfo)


module.exports=router
const express=require('express')
const productController=require("../controllers/Product")
const productEventController=require("../controllers/ProductEventCtrl")
const router=express.Router()
const { verifyToken, optionalVerifyToken } = require("../middleware/VerifyToken")
const { requireAdmin } = require("../middleware/Authz")

router
    .post("/",verifyToken,requireAdmin,productController.create)
    .post("/track", optionalVerifyToken, productEventController.track)
    .get("/",productController.getAll)
    .get("/by-ids", productController.getByIds)
    .get("/similar/:id", productController.getSimilar)
    .get("/recommended", productController.getRecommended)
    .get("/:id",productController.getById)
    .patch("/:id",verifyToken,requireAdmin,productController.updateById)
    .patch("/undelete/:id",verifyToken,requireAdmin,productController.undeleteById)
    .delete("/:id",verifyToken,requireAdmin,productController.deleteById)

module.exports=router
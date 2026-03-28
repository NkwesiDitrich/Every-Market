const express=require('express')
const reviewController=require("../controllers/Review")
const router=express.Router()
const { verifyToken } = require("../middleware/VerifyToken")
const { validateBody } = require("../middleware/Validate")
const { schemas } = require("../validation/schemas")


router
    .post("/",verifyToken,validateBody(schemas.review.create),reviewController.create)
    .get('/product/:id',reviewController.getByProductId)
    .patch('/:id',verifyToken,validateBody(schemas.review.update),reviewController.updateById)
    .delete("/:id",verifyToken,reviewController.deleteById)

module.exports=router
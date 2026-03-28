const express=require("express")
const wishlistController=require("../controllers/Wishlist")
const router=express.Router()
const { verifyToken } = require("../middleware/VerifyToken")
const { requireSelfOrAdmin } = require("../middleware/Authz")
const { validateBody } = require("../middleware/Validate")
const { schemas } = require("../validation/schemas")


router
    .post("/",verifyToken,validateBody(schemas.wishlist.create),wishlistController.create)
    .get("/user/:id",verifyToken,requireSelfOrAdmin,wishlistController.getByUserId)
    .patch("/:id",verifyToken,validateBody(schemas.wishlist.update),wishlistController.updateById)
    .delete("/:id",verifyToken,wishlistController.deleteById)
    .post("/toggle-public", verifyToken, wishlistController.toggleWishlistPublic)
    .get("/public/:id", wishlistController.getPublicByUserId)

module.exports=router
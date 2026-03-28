const { seedBrand } = require("./Brand")
const { seedCategory } = require("./Category")
const { seedProduct } = require("./Product")
const { seedUser } = require("./User")
const { seedAddress } = require("./Address")
const { seedWishlist } = require("./Wishlist")
const { seedCart } = require("./Cart")
const { seedReview } = require("./Review")
const { seedOrder } = require("./Order")
const { connectToDB } = require("../database/db")
const Order = require("../models/Order")
const Review = require("../models/Review")
const Cart = require("../models/Cart")
const Wishlist = require("../models/Wishlist")
const Address = require("../models/Address")
const Product = require("../models/Product")
const User = require("../models/User")
const Category = require("../models/Category")
const Brand = require("../models/Brand")

/** Clear seeded collections so re-running seed doesn't hit duplicate _id errors. Order: dependents first. */
const clearSeededCollections = async () => {
  await Order.deleteMany({})
  await Review.deleteMany({})
  await Cart.deleteMany({})
  await Wishlist.deleteMany({})
  await Address.deleteMany({})
  await Product.deleteMany({})
  await User.deleteMany({})
  await Category.deleteMany({})
  await Brand.deleteMany({})
  console.log("Cleared existing seed data.")
}

const seedData = async () => {
  try {
    await connectToDB()
    console.log("Seed [started] please wait..")
    await clearSeededCollections()
    await seedBrand()
        await seedCategory()
        await seedProduct()
        await seedUser()
        await seedAddress()
        await seedWishlist()
        await seedCart()
        await seedReview()
        await seedOrder()

        console.log('Seed completed..');
    } catch (error) {
        console.log(error);
    }
}

seedData()
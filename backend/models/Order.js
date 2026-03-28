const mongoose=require("mongoose")
const {Schema}=mongoose

const orderItemSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    commissionRate: { type: Number, default: 0 },
    commissionAmount: { type: Number, default: 0 },
    sellerPayout: { type: Number, default: 0 },
}, { _id: false });

const orderSchema=new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:false // Allow guest orders
    },
    guestInfo: {
        email: String,
        firstName: String,
        lastName: String,
        phone: String
    },
    item: [orderItemSchema],
    address:{
        type:[Schema.Types.Mixed],
        required:true
    },
    status:{
        type:String,
        enum:['Pending','Confirmed','Shipped','Out for delivery','Delivered','Cancelled','Returned'],
        default:'Pending'
    },
    paymentMode:{
        type:String,
        enum:['COD','UPI','CARD','STRIPE','PAYPAL','MOBILE_MONEY','ORANGE_MONEY'],
        required:true
    },
    paymentStatus:{
        type:String,
        enum:['UNPAID','PENDING','PAID','FAILED','REFUNDED'],
        default:'UNPAID'
    },
    paymentProvider:{
        type:String,
        enum:['COD','STRIPE','PAYPAL','FLUTTERWAVE','MOBILE_MONEY','ORANGE_MONEY'],
        required:false
    },
    paymentReference:{
        type:String,
        required:false
    },
    currency:{
        type:String,
        default:'USD'
    },
    paidAt:{
        type:Date,
        required:false
    },
    total:{
        type:Number,
        required:true
    },
    commissionTotal:{
        type:Number,
        default:0
    },
    netProfit:{
        type:Number,
        default:0
    },
    couponCode:{ type:String },
    discount:{ type:Number, default:0 },
    loyaltyPointsRedeemed:{ type:Number, default:0 },
    trackingNumber:{ type:String },
    carrierName:{ type:String },
    createdAt:{
        type:Date,
        default:Date.now
    },
},{versionKey:false})

module.exports=mongoose.model("Order",orderSchema)
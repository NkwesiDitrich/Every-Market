const mongoose = require("mongoose")
const { Schema } = mongoose

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    seller: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    shortDescription: {
        type: String,
        required: true
    },
    fullDescription: {
        type: String, // HTML content from rich text editor
        required: true
    },
    productType: {
        type: String,
        enum: ["physical", "digital", "service"],
        default: "physical"
    },
    sku: {
        type: String,
        unique: true,
        sparse: true // Allow nulls for old products without SKU
    },
    price: {
        type: Number,
        required: true
    },
    regularPrice: {
        type: Number,
        required: false // Original price if on sale
    },
    discountPercentage: {
        type: Number,
        default: 0,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    brand: {
        type: Schema.Types.ObjectId,
        ref: "Brand",
        required: false
    },
    stockQuantity: {
        type: Number,
        required: true
    },
    lowStockThreshold: {
        type: Number,
        default: 5
    },
    stockStatus: {
        type: String,
        enum: ["in_stock", "low_stock", "out_of_stock"],
        default: "in_stock"
    },
    thumbnail: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        required: true
    },
    productVideo: {
        type: String,
        required: false
    },
    variants: [{
        size: String,
        color: String,
        material: String,
        price: Number,
        stock: Number,
        sku: String,
        thumbnail: String
    }],
    shippingInfo: {
        weight: { type: Number }, // in kg
        dimensions: {
            length: { type: Number },
            width: { type: Number },
            height: { type: Number }
        }
    },
    attributes: {
        type: Map,
        of: String
    },
    seo: {
        title: String,
        description: String,
        slug: { type: String, unique: true, sparse: true },
        keywords: [String]
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["draft", "pending", "approved", "rejected"],
        default: "approved",
        index: true
    },
    flashSalePrice: { type: Number },
    flashSaleStartsAt: { type: Date },
    flashSaleEndsAt: { type: Date },
}, { timestamps: true, versionKey: false })

// Auto-sync stock status before saving
productSchema.pre('save', function (next) {
    if (this.isModified('stockQuantity') || this.isModified('lowStockThreshold')) {
        if (this.stockQuantity <= 0) {
            this.stockStatus = "out_of_stock";
        } else if (this.stockQuantity <= this.lowStockThreshold) {
            this.stockStatus = "low_stock";
        } else {
            this.stockStatus = "in_stock";
        }
    }
    next();
});

productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ isDeleted: 1, status: 1 });
productSchema.index({ price: 1 }); // for sorting
productSchema.index({ createdAt: -1 }); // for new arrivals/sorting

productSchema.index({ title: "text", shortDescription: "text", fullDescription: "text" })

module.exports = mongoose.model('Product', productSchema)
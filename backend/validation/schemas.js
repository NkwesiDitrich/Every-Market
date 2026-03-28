const { z } = require("zod");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

exports.schemas = {
  auth: {
    signup: z.object({
      name: z.string().trim().min(2).max(60),
      email: z.string().trim().email(),
      password: z.string().min(8).max(200),
    }),
    login: z.object({
      email: z.string().trim().email(),
      password: z.string().min(1).max(200),
    }),
    resendOtp: z.object({
      user: objectId.optional(),
    }).passthrough(),
    verifyOtp: z.object({
      otp: z.string().trim().min(4).max(8),
      userId: objectId.optional(),
    }).passthrough(),
    verify2FA: z.object({
      tempToken: z.string().trim().min(1),
      otp: z.string().trim().min(4).max(8),
    }),
    confirm2FA: z.object({
      otp: z.string().trim().min(4).max(8),
    }),
    forgotPassword: z.object({
      email: z.string().trim().email(),
    }),
    resetPassword: z.object({
      userId: objectId,
      token: z.string().min(10),
      password: z.string().min(8).max(200),
    }),
  },
  cart: {
    create: z.object({
      product: objectId,
      quantity: z.number().int().min(1).max(999).optional(),
      user: objectId.optional(),
    }).passthrough(),
    update: z.object({
      quantity: z.number().int().min(1).max(999).optional(),
      user: objectId.optional(),
      product: objectId.optional(),
    }).passthrough(),
  },
  wishlist: {
    create: z.object({
      product: objectId,
      note: z.string().max(500).optional(),
      user: objectId.optional(),
    }).passthrough(),
    update: z.object({
      note: z.string().max(500).optional(),
      user: objectId.optional(),
      product: objectId.optional(),
    }).passthrough(),
  },
  address: {
    create: z.object({
      type: z.string().trim().min(2).max(50),
      street: z.string().trim().min(2).max(120),
      city: z.string().trim().min(2).max(80),
      state: z.string().trim().min(1).max(80),
      postalCode: z.string().trim().min(2).max(20),
      country: z.string().trim().min(2).max(80),
      phoneNumber: z.string().trim().min(6).max(30),
      user: objectId.optional(),
    }).passthrough(),
    update: z.object({
      type: z.string().trim().min(2).max(50).optional(),
      street: z.string().trim().min(2).max(120).optional(),
      city: z.string().trim().min(2).max(80).optional(),
      state: z.string().trim().min(1).max(80).optional(),
      postalCode: z.string().trim().min(2).max(20).optional(),
      country: z.string().trim().min(2).max(80).optional(),
      phoneNumber: z.string().trim().min(6).max(30).optional(),
      user: objectId.optional(),
    }).passthrough(),
  },
  order: {
    create: z.object({
      address: z.any(),
      paymentMode: z.enum(["COD", "UPI", "CARD", "STRIPE", "PAYPAL", "MOBILE_MONEY", "ORANGE_MONEY"]),
      // Ignore client-provided user/item/total; server derives from token + cart.
      user: objectId.optional(),
      item: z.any().optional(),
      total: z.any().optional(),
    }).passthrough(),
    guestCreate: z.object({
      guestEmail: z.string().trim().email(),
      address: z.any(),
      items: z.array(z.object({
        productId: objectId.optional(),
        product: objectId.optional(),
        _id: objectId.optional(),
        quantity: z.number().int().min(1).max(999),
      }).passthrough()).min(1),
      paymentMode: z.enum(["COD", "STRIPE", "PAYPAL", "MOBILE_MONEY", "ORANGE_MONEY"]).optional(),
    }).passthrough(),
    update: z.object({
      status: z.enum(["Pending", "Confirmed", "Shipped", "Out for delivery", "Delivered", "Cancelled", "Returned"]).optional(),
    }).passthrough(),
  },
  review: {
    create: z.object({
      product: objectId,
      rating: z.number().int().min(1).max(5),
      comment: z.string().trim().min(1).max(2000),
      user: objectId.optional(),
    }).passthrough(),
    update: z.object({
      rating: z.number().int().min(1).max(5).optional(),
      comment: z.string().trim().min(1).max(2000).optional(),
      user: objectId.optional(),
      product: objectId.optional(),
    }).passthrough(),
  },
  user: {
    update: z.object({
      name: z.string().trim().min(2).max(60).optional(),
      email: z.string().trim().email().optional(),
    }).passthrough(),
  },
};


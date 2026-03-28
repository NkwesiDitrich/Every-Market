const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');

const fixProducts = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        console.log('Updating products missing status or having null status...');
        const result = await Product.updateMany(
            { $or: [{ status: { $exists: false } }, { status: null }] },
            { $set: { status: 'approved' } }
        );

        console.log(`Update completed. Modified ${result.modifiedCount} products.`);
        process.exit(0);
    } catch (error) {
        console.error('Error fixing products:', error);
        process.exit(1);
    }
};

fixProducts();

const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

async function run() {
    try {
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI is missing from .env');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const total = await Product.countDocuments();
        const approved = await Product.countDocuments({ status: 'approved' });
        const notDeleted = await Product.countDocuments({ isDeleted: false });
        const both = await Product.countDocuments({ status: 'approved', isDeleted: false });

        console.log('Total Products:', total);
        console.log('Approved Products:', approved);
        console.log('Not Deleted Products:', notDeleted);
        console.log('Approved & Not Deleted:', both);

        if (total > 0) {
            const one = await Product.findOne().lean();
            console.log('Sample Product keys:', Object.keys(one));
            console.log('Sample Product _id:', one._id);
            console.log('Sample Product status:', one.status);
            console.log('Sample Product isDeleted:', one.isDeleted);
        } else {
            console.log('No products found in database.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

run();

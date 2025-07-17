// Create default admin user
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const createDefaultAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB');

        // Check if admin already exists
        const adminExists = await User.findOne({ role: 'admin' });

        if (adminExists) {
            console.log('Admin user already exists:', adminExists.email);
            process.exit(0);
        }

        // Create default admin
        const defaultAdmin = new User({
            name: 'Admin User',
            email: 'yugaldhiman14@gmail.com',
            password: 'Admin123', // Will be hashed automatically by the model
            role: 'admin'
        });

        await defaultAdmin.save();

        console.log('✅ Default admin user created successfully!');
        console.log('Email: yugaldhiman14@gmail.com');
        console.log('Password: admin123');
        console.log('⚠️  Please change the default password after first login!');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
};

createDefaultAdmin();

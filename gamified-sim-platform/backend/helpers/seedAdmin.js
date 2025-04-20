const mongoose = require('mongoose');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/algorithmSimulator', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('MongoDB connected. Seeding admin user...');

    const existingAdmin = await User.findOne({ email: 'admin@sim.com' });

    if (!existingAdmin) {
        await User.create({
            username: 'admin',
            email: 'admin@sim.com',
            password: 'admin123', // this will get hashed automatically
            role: 'admin',
            isVerified: true
        });

        console.log('✅ Default admin user created: admin@sim.com / admin123');
    } else {
        console.log('ℹ️ Admin user already exists.');
    }

    process.exit();
});
const mongoose = require('mongoose');
const Event = require('../models/Event');
require('dotenv').config();

const checkEvents = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/complaint_management');
        const count = await Event.countDocuments();
        console.log(`Current Event Count: ${count}`);
        if (count === 0) {
            console.log('No events found. Seeding a test event...');
            const User = require('./models/User');
            const admin = await User.findOne({ role: 'admin' });
            if (admin) {
                await Event.create({
                    title: 'New Water Pipeline Installation',
                    category: 'Infrastructure',
                    description: 'Complete replacement of local water supply pipelines starting from Ward 3. This will ensure 24/7 water supply to all households.',
                    date: new Date(),
                    location: 'Ward 3, North Block',
                    createdBy: admin._id
                });
                console.log('Test event created.');
            } else {
                console.log('No admin found to link the event.');
            }
        } else {
            const allEvents = await Event.find();
            console.log('Events:', JSON.stringify(allEvents, null, 2));
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error checking events:', err);
    }
};

checkEvents();

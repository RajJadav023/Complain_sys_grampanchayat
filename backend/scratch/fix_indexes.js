const mongoose = require('mongoose');
require('dotenv').config();

const fixIndexes = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/complaint_management';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const collection = mongoose.connection.collection('users');
        
        try {
            await collection.dropIndex('username_1');
            console.log('Successfully dropped index: username_1');
        } catch (err) {
            if (err.codeName === 'IndexNotFound' || err.message.includes('index not found')) {
                console.log('Index username_1 not found, nothing to drop.');
            } else {
                throw err;
            }
        }

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (err) {
        console.error('Error fixing indexes:', err.message);
        process.exit(1);
    }
};

fixIndexes();

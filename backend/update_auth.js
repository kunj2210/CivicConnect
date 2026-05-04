import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/civic_connect', {})
    .then(async () => {
        const db = mongoose.connection.db;
        const result = await db.collection('users').updateOne(
            { email: 'authority@civicconnect.gov' },
            { $set: { departmentId: 1 } }
        );
        console.log('Update Result:', result);
        mongoose.disconnect();
    }).catch(err => console.error(err));

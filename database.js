require('dns').setServers(['1.1.1.1', '8.8.8.8']);
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://astha12:*********@cluster0.weatwyz.mongodb.net/rescuenet?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB (RescueNet)'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

const SOSSchema = new mongoose.Schema({
  victimName: { type: String, default: 'Anonymous' },
  phoneNumber: String,
  needs: [{ type: String }],
  status: { type: String, enum: ['PENDING', 'RESOLVED'], default: 'PENDING' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true } // [Longitude, Latitude]
  },
  createdAt: { type: Date, default: Date.now }
});

// Enable spatial indexing for geo queries
SOSSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SOSRequest', SOSSchema);

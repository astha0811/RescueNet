const express = require('express');
const cors = require('cors');
const path = require('path');
const SOSRequest = require('./database');
const clusterSOSRequests = require('./cluster');

const app = express();
app.use(express.json());
app.use(cors());

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, 'public')));

// POST: Submit SOS Request
app.post('/api/sos', async (req, res) => {
  try {
    const { name, phone, needs, latitude, longitude } = req.body;
    if (!latitude || !longitude) return res.status(400).json({ error: 'Location required' });

    const newSOS = await SOSRequest.create({
      victimName: name || 'Anonymous',
      phoneNumber: phone || 'N/A',
      needs: needs && needs.length ? needs : ['WATER'],
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      }
    });

    res.status(201).json({ success: true, sosId: newSOS._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: All raw SOS requests
app.get('/api/sos/raw', async (req, res) => {
  const sosList = await SOSRequest.find({ status: 'PENDING' });
  res.json(sosList);
});

// GET: Calculated clusters for NGO Map
app.get('/api/sos/clusters', async (req, res) => {
  const pendingRequests = await SOSRequest.find({ status: 'PENDING' });
  const clusters = clusterSOSRequests(pendingRequests, 1.0); // 1 km radius
  res.json(clusters);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 RescueNet live on http://localhost:${PORT}`));
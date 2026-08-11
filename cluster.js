// Haversine formula to compute geographical distance in km
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// Groups SOS requests within a specified radius (default 1.0 km)
function clusterSOSRequests(sosList, radiusInKm = 1.0) {
  const clusters = [];
  const processed = new Set();

  for (let i = 0; i < sosList.length; i++) {
    const base = sosList[i];
    if (processed.has(base._id.toString())) continue;

    const group = [base];
    processed.add(base._id.toString());

    for (let j = i + 1; j < sosList.length; j++) {
      const target = sosList[j];
      if (processed.has(target._id.toString())) continue;

      const dist = getHaversineDistance(
        base.location.coordinates[1], base.location.coordinates[0],
        target.location.coordinates[1], target.location.coordinates[0]
      );

      if (dist <= radiusInKm) {
        group.push(target);
        processed.add(target._id.toString());
      }
    }

    const demandSummary = {};
    group.forEach(req => {
      req.needs.forEach(need => {
        demandSummary[need] = (demandSummary[need] || 0) + 1;
      });
    });

    clusters.push({
      totalVictims: group.length,
      centroid: [base.location.coordinates[1], base.location.coordinates[0]], // [Lat, Lng]
      demandSummary,
      urgency: group.length >= 5 ? 'HIGH' : 'MEDIUM'
    });
  }

  return clusters;
}

module.exports = clusterSOSRequests;
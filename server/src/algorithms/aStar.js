// A* pathfinding algorithm with haversine heuristic
const { haversineDistance } = require('../utils/haversine');

function aStar(graph, nodes, startId, endId) {
  const endNode = nodes.find(n => String(n.id) === String(endId));
  const heuristic = (nodeId) => {
    const node = nodes.find(n => String(n.id) === String(nodeId));
    if (!node || !endNode) return 0;
    return haversineDistance(node.lat, node.lng, endNode.lat, endNode.lng);
  };
  const openSet = new Set([startId]);
  const cameFrom = {};
  const gScore = {}, fScore = {};
  for (const n of Object.keys(graph)) { gScore[n] = Infinity; fScore[n] = Infinity; }
  gScore[startId] = 0;
  fScore[startId] = heuristic(startId);

  while (openSet.size > 0) {
    let current = null, minF = Infinity;
    for (const n of openSet) { if (fScore[n] < minF) { minF = fScore[n]; current = n; } }
    if (current === endId) {
      const path = [];
      let c = endId;
      while (c) { path.unshift(c); c = cameFrom[c]; }
      return { path, totalDistance: Math.round(gScore[endId] * 100) / 100, algorithm: 'a_star' };
    }
    openSet.delete(current);
    for (const [neighbor, weight] of Object.entries(graph[current] || {})) {
      const tentG = gScore[current] + weight;
      if (tentG < gScore[neighbor]) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentG;
        fScore[neighbor] = tentG + heuristic(neighbor);
        openSet.add(neighbor);
      }
    }
  }
  return { path: [startId], totalDistance: 0, algorithm: 'a_star' };
}
module.exports = aStar;

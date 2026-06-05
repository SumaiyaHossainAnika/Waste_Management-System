// Dijkstra's shortest path algorithm
function dijkstra(graph, startId, endId) {
  const dist = {}, prev = {}, visited = new Set();
  const nodes = Object.keys(graph);
  for (const n of nodes) { dist[n] = Infinity; prev[n] = null; }
  dist[startId] = 0;
  while (true) {
    let current = null, minDist = Infinity;
    for (const n of nodes) {
      if (!visited.has(n) && dist[n] < minDist) { minDist = dist[n]; current = n; }
    }
    if (current === null || current === endId) break;
    visited.add(current);
    for (const [neighbor, weight] of Object.entries(graph[current] || {})) {
      const alt = dist[current] + weight;
      if (alt < dist[neighbor]) { dist[neighbor] = alt; prev[neighbor] = current; }
    }
  }
  const path = [];
  let curr = endId;
  while (curr) { path.unshift(curr); curr = prev[curr]; }
  return { path, totalDistance: Math.round(dist[endId] * 100) / 100, algorithm: 'dijkstra' };
}
module.exports = dijkstra;

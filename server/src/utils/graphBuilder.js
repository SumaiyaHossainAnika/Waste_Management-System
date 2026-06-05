const { haversineDistance } = require('./haversine');

function buildGraph(nodes) {
  const graph = {};
  for (const node of nodes) {
    graph[node.id] = {};
    for (const other of nodes) {
      if (node.id !== other.id) {
        graph[node.id][other.id] = haversineDistance(node.lat, node.lng, other.lat, other.lng);
      }
    }
  }
  return graph;
}
module.exports = { buildGraph };

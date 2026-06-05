// TSP: Nearest Neighbor heuristic + 2-opt improvement
function tsp(graph, nodes) {
  const ids = nodes.map(n => n.id);
  // Nearest neighbor
  const visited = new Set();
  const path = [ids[0]];
  visited.add(ids[0]);
  while (visited.size < ids.length) {
    const current = path[path.length - 1];
    let nearest = null, minDist = Infinity;
    for (const id of ids) {
      if (!visited.has(id) && graph[current][id] < minDist) {
        minDist = graph[current][id]; nearest = id;
      }
    }
    if (nearest) { path.push(nearest); visited.add(nearest); }
    else break;
  }
  // 2-opt improvement
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < path.length - 2; i++) {
      for (let j = i + 1; j < path.length - 1; j++) {
        const d1 = graph[path[i - 1]][path[i]] + graph[path[j]][path[j + 1]];
        const d2 = graph[path[i - 1]][path[j]] + graph[path[i]][path[j + 1]];
        if (d2 < d1) {
          const reversed = path.slice(i, j + 1).reverse();
          path.splice(i, j - i + 1, ...reversed);
          improved = true;
        }
      }
    }
  }
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) totalDistance += graph[path[i]][path[i + 1]];
  return { path, totalDistance: Math.round(totalDistance * 100) / 100, algorithm: 'tsp' };
}
module.exports = tsp;

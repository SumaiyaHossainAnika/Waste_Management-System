// VRP: Clarke-Wright Savings Algorithm
function vrp(graph, nodes, vehicleCount) {
  const depot = nodes[0].id;
  const customers = nodes.slice(1).map(n => n.id);
  // Calculate savings s(i,j) = d(depot,i) + d(depot,j) - d(i,j)
  const savings = [];
  for (let i = 0; i < customers.length; i++) {
    for (let j = i + 1; j < customers.length; j++) {
      const s = graph[depot][customers[i]] + graph[depot][customers[j]] - graph[customers[i]][customers[j]];
      savings.push({ i: customers[i], j: customers[j], saving: s });
    }
  }
  savings.sort((a, b) => b.saving - a.saving);
  // Initialize routes: one per customer
  let routes = customers.map(c => [c]);
  const findRoute = (nodeId) => routes.findIndex(r => r.includes(nodeId));
  const isInterior = (route, nodeId) => route.length > 1 && route[0] !== nodeId && route[route.length - 1] !== nodeId;
  for (const { i, j } of savings) {
    const ri = findRoute(i), rj = findRoute(j);
    if (ri === -1 || rj === -1 || ri === rj) continue;
    if (isInterior(routes[ri], i) || isInterior(routes[rj], j)) continue;
    if (routes.length <= vehicleCount) break;
    const merged = [...routes[ri], ...routes[rj]];
    routes = routes.filter((_, idx) => idx !== ri && idx !== rj);
    routes.push(merged);
  }
  // Force merge if too many routes
  while (routes.length > vehicleCount && routes.length > 1) {
    const r1 = routes.pop();
    routes[routes.length - 1] = [...routes[routes.length - 1], ...r1];
  }
  // Add depot to start/end of each route
  const finalRoutes = routes.map(r => [depot, ...r, depot]);
  let totalDistance = 0;
  const routeDetails = finalRoutes.map((route, idx) => {
    let dist = 0;
    for (let k = 0; k < route.length - 1; k++) dist += graph[route[k]][route[k + 1]];
    totalDistance += dist;
    return { vehicle: idx + 1, route, distance: Math.round(dist * 100) / 100 };
  });
  const allPath = finalRoutes.flat();
  return { path: allPath, routes: routeDetails, totalDistance: Math.round(totalDistance * 100) / 100, algorithm: 'vrp', vehicleCount };
}
module.exports = vrp;

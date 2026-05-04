import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp-up to 50 users
    { duration: '5m', target: 50 },  // Stay at 50 users (Steady state)
    { duration: '2m', target: 100 }, // Spike to 100 users
    { duration: '2m', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:5000/api';

export default function () {
  // 1. Fetch Nearby Reports (GIS Query)
  const nearbyResponse = http.get(`${BASE_URL}/reports/nearby?latitude=23.3441&longitude=85.3091&radius=5000`);
  check(nearbyResponse, { 'GIS Query Status 200': (r) => r.status === 200 });

  sleep(1);

  // 2. Fetch Stats (Dashboard Load)
  const statsResponse = http.get(`${BASE_URL}/reports/stats`);
  check(statsResponse, { 'Stats Status 200': (r) => r.status === 200 });

  sleep(2);

  // 3. Post a Report (Simulate High-Concurrency reporting)
  // Note: Requires Auth Token in real scenario
  /*
  const payload = JSON.stringify({
    category: 'Pothole',
    description: 'Load test pothole',
    latitude: 23.35,
    longitude: 85.31
  });
  const params = { headers: { 'Content-Type': 'application/json' } };
  http.post(`${BASE_URL}/reports`, payload, params);
  */
}

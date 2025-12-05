import http from 'k6/http';
import { check, sleep } from 'k6';

// Performance test configuration
export const options = {
  stages: [
    { duration: '1m', target: 20 },   // Ramp up to 20 users over 1 minute
    { duration: '2m', target: 20 },   // Stay at 20 users for 2 minutes
    { duration: '1m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'],  // 95% of requests must complete below 2s
    'http_req_failed': ['rate<0.01'],     // Error rate must be below 1%
  },
};

export default function () {
  // Test 1: Homepage Load Time
  let res = http.get('http://localhost:8000/');
  
  check(res, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads under 1s': (r) => r.timings.duration < 1000,
  });

  sleep(1);

  // Test 2: Login Page Response Time
  res = http.get('http://localhost:8000/wp-login.php');
  
  check(res, {
    'login page status is 200': (r) => r.status === 200,
    'login page response time under 800ms': (r) => r.timings.duration < 800,
  });

  sleep(1);

  // Test 3: Admin Page Load Time
  res = http.get('http://localhost:8000/wp-admin/');
  
  check(res, {
    'admin page responds': (r) => r.status === 200 || r.status === 302,
    'admin page response time under 1.5s': (r) => r.timings.duration < 1500,
  });

  sleep(2);
}

export function handleSummary(data) {
  return {
    'performance-summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  return `
${indent}Performance Test Results:
${indent}========================
${indent}Total Requests: ${data.metrics.http_reqs.values.count}
${indent}Failed Requests: ${data.metrics.http_req_failed.values.passes || 0}
${indent}Avg Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms
${indent}95th Percentile: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms
${indent}Max Response Time: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms
  `;
}
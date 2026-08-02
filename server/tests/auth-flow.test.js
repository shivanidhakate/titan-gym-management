const assert = require('assert');
const http = require('http');

function requestJson(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

(async () => {
  const loginResponse = await requestJson('POST', '/api/auth/login', {
    email: 'member@titangym.com',
    password: 'member123'
  });

  assert.strictEqual(loginResponse.statusCode, 200, 'login should return 200');
  assert.strictEqual(loginResponse.body.success, true, 'login should succeed');

  const meResponse = await requestJson('GET', '/api/auth/me', null, {
    Authorization: `Bearer ${loginResponse.body.token}`
  });

  assert.strictEqual(meResponse.statusCode, 200, 'session lookup should return 200');
  assert.strictEqual(meResponse.body.success, true, 'session lookup should succeed');
  console.log('auth-flow test passed');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

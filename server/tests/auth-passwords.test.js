const assert = require('assert');
const http = require('http');

function requestJson(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers: { 'Content-Type': 'application/json', ...headers }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  const adminLogin = await requestJson('POST', '/api/auth/login', {
    email: 'admin@titangym.com',
    password: 'admin123'
  });
  assert.strictEqual(adminLogin.statusCode, 200, 'admin login should succeed');

  const trainerLogin = await requestJson('POST', '/api/auth/login', {
    email: 'john.trainer@titangym.com',
    password: 'trainer123'
  });
  assert.strictEqual(trainerLogin.statusCode, 200, 'trainer login should succeed');

  const passwordChange = await requestJson('POST', '/api/auth/change-password', {
    currentPassword: 'trainer123',
    newPassword: 'trainer-john-2026'
  }, { Authorization: `Bearer ${trainerLogin.body.token}` });

  assert.strictEqual(passwordChange.statusCode, 200, 'password change should succeed');

  const adminPasswordChange = await requestJson('PUT', `/api/admin/users/${trainerLogin.body._id}/password`, {
    newPassword: 'trainer-john-2026-admin'
  }, { Authorization: `Bearer ${adminLogin.body.token}` });

  assert.strictEqual(adminPasswordChange.statusCode, 200, 'admin password reset should succeed');

  console.log('password-flow test passed');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

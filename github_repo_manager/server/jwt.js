const jwt = require('jsonwebtoken');

const payload = { userId: 123, role: 'admin' };
const secret = 'your-secret-key';
const options = { expiresIn: '1h' };

const token = jwt.sign(payload, secret, options);

console.log(token);

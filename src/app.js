const express = require('express');
const app = express();

app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to DevOps Demo API',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: 'Alice Johnson', role: 'admin', active: true },
    { id: 2, name: 'Bob Smith',    role: 'developer', active: true },
    { id: 3, name: 'Carol White',  role: 'devops', active: false },
  ];
  res.status(200).json({ success: true, count: users.length, data: users });
});

app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const users = [
    { id: 1, name: 'Alice Johnson', role: 'admin', active: true },
    { id: 2, name: 'Bob Smith',    role: 'developer', active: true },
    { id: 3, name: 'Carol White',  role: 'devops', active: false },
  ];
  const user = users.find((u) => u.id === id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.status(200).json({ success: true, data: user });
});

app.post('/api/users', (req, res) => {
  const { name, role } = req.body;
  if (!name || !role) {
    return res.status(400).json({ success: false, message: 'Name and role are required' });
  }
  const newUser = { id: Date.now(), name, role, active: true };
  res.status(201).json({ success: true, message: 'User created', data: newUser });
});

app.get('/api/products', (req, res) => {
  const products = [
    { id: 1, name: 'API Gateway',    price: 49.99,  stock: 100 },
    { id: 2, name: 'Load Balancer',  price: 99.99,  stock: 50  },
    { id: 3, name: 'Cache Service',  price: 29.99,  stock: 200 },
  ];
  res.status(200).json({ success: true, count: products.length, data: products });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Error Handler ────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

module.exports = app;

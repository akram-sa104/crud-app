const express = require('express');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// IN-MEMORY DATABASE (simulasi database)
// ============================================================
let products = [
  { id: 1, name: 'Laptop ASUS', category: 'Electronics', price: 8500000, stock: 10 },
  { id: 2, name: 'Mouse Logitech', category: 'Electronics', price: 250000, stock: 50 },
  { id: 3, name: 'Keyboard Mechanical', category: 'Electronics', price: 450000, stock: 30 },
];
let nextId = 4;

// ============================================================
// HELPER FUNCTIONS
// ============================================================
const successResponse = (res, statusCode, message, data = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({ success: false, message });
};

// ============================================================
// ROUTES
// ============================================================

// Root
app.get('/', (req, res) => {
  res.json({
    message: '🚀 CRUD API with Express.js',
    version: '1.0.0',
    endpoints: {
      'GET    /api/products':         'Get all products',
      'GET    /api/products/:id':     'Get product by ID',
      'POST   /api/products':         'Create new product',
      'PUT    /api/products/:id':     'Update product by ID',
      'DELETE /api/products/:id':     'Delete product by ID',
    }
  });
});

// ----------------------------------------------------------
// CREATE - POST /api/products
// ----------------------------------------------------------
app.post('/api/products', (req, res) => {
  const { name, category, price, stock } = req.body;

  // Validasi
  if (!name || !category || price === undefined || stock === undefined) {
    return errorResponse(res, 400, 'Field name, category, price, dan stock wajib diisi');
  }
  if (typeof price !== 'number' || price < 0) {
    return errorResponse(res, 400, 'Price harus berupa angka positif');
  }
  if (typeof stock !== 'number' || stock < 0) {
    return errorResponse(res, 400, 'Stock harus berupa angka positif');
  }

  const newProduct = {
    id: nextId++,
    name: name.trim(),
    category: category.trim(),
    price,
    stock,
    createdAt: new Date().toISOString(),
  };

  products.push(newProduct);
  return successResponse(res, 201, 'Product berhasil dibuat', newProduct);
});

// ----------------------------------------------------------
// READ ALL - GET /api/products
// ----------------------------------------------------------
app.get('/api/products', (req, res) => {
  const { category, search } = req.query;

  let result = [...products];

  // Filter by category
  if (category) {
    result = result.filter(p =>
      p.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Search by name
  if (search) {
    result = result.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  return successResponse(res, 200, `Ditemukan ${result.length} product`, {
    total: result.length,
    products: result,
  });
});

// ----------------------------------------------------------
// READ ONE - GET /api/products/:id
// ----------------------------------------------------------
app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return errorResponse(res, 400, 'ID harus berupa angka');
  }

  const product = products.find(p => p.id === id);

  if (!product) {
    return errorResponse(res, 404, `Product dengan ID ${id} tidak ditemukan`);
  }

  return successResponse(res, 200, 'Product ditemukan', product);
});

// ----------------------------------------------------------
// UPDATE - PUT /api/products/:id
// ----------------------------------------------------------
app.put('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return errorResponse(res, 400, 'ID harus berupa angka');
  }

  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return errorResponse(res, 404, `Product dengan ID ${id} tidak ditemukan`);
  }

  const { name, category, price, stock } = req.body;

  // Validasi hanya field yang dikirim
  if (price !== undefined && (typeof price !== 'number' || price < 0)) {
    return errorResponse(res, 400, 'Price harus berupa angka positif');
  }
  if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
    return errorResponse(res, 400, 'Stock harus berupa angka positif');
  }

  // Update field yang dikirim saja (partial update)
  const updatedProduct = {
    ...products[index],
    ...(name     && { name: name.trim() }),
    ...(category && { category: category.trim() }),
    ...(price    !== undefined && { price }),
    ...(stock    !== undefined && { stock }),
    updatedAt: new Date().toISOString(),
  };

  products[index] = updatedProduct;
  return successResponse(res, 200, 'Product berhasil diupdate', updatedProduct);
});

// ----------------------------------------------------------
// DELETE - DELETE /api/products/:id
// ----------------------------------------------------------
app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return errorResponse(res, 400, 'ID harus berupa angka');
  }

  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return errorResponse(res, 404, `Product dengan ID ${id} tidak ditemukan`);
  }

  const deletedProduct = products.splice(index, 1)[0];
  return successResponse(res, 200, `Product "${deletedProduct.name}" berhasil dihapus`, deletedProduct);
});

// ----------------------------------------------------------
// 404 Handler
// ----------------------------------------------------------
app.use((req, res) => {
  errorResponse(res, 404, `Route ${req.method} ${req.path} tidak ditemukan`);
});

// ----------------------------------------------------------
// Error Handler Global
// ----------------------------------------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  errorResponse(res, 500, 'Internal Server Error');
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
  console.log(`📖 Dokumentasi endpoint: http://localhost:${PORT}`);
});

module.exports = app;
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  oldPrice: { type: Number },
  description: { type: String, required: true },
  images: [{ type: String }],
  sizes: [{ type: Number }],
  color: { type: String, required: true }, // Pridėta spalva filtravimui
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  salesCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  trending: { type: Boolean, default: false },
  rating: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);

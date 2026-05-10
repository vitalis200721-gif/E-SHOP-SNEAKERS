const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const brands = ['Nike', 'Jordan', 'Adidas', 'Puma', 'New Balance', 'Reebok'];
const colors = ['White', 'Black', 'Red', 'Blue', 'Grey', 'Green'];
const categories = ['Lifestyle', 'Basketball', 'Running', 'Training'];

const sneakerImages = [
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=100&w=1500',
  'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=1500',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=1500',
  'https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&q=80&w=1500',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1500',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1500',
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=1500',
  'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?auto=format&fit=crop&q=80&w=1500'
];

const generateRealisticProducts = () => {
  const products = [];
  for (let i = 0; i < 210; i++) {
    const brand = brands[i % brands.length];
    const color = colors[i % colors.length];
    const category = categories[i % categories.length];
    const price = Math.floor(Math.random() * (250 - 80) + 80);
    const hasDiscount = Math.random() > 0.8;
    const stock = Math.floor(Math.random() * 50);

    // Sukuriame atsitiktinę nuotraukų tvarką, bet visada bent 6-8 nuotraukas
    const shuffledImages = [...sneakerImages].sort(() => 0.5 - Math.random());

    products.push({
      name: `${brand} ${category} Elite v${i + 1}`,
      brand,
      color,
      category,
      price: hasDiscount ? Math.floor(price * 0.8) : price,
      oldPrice: hasDiscount ? price : null,
      description: `Experience the pinnacle of footwear with the ${brand} Elite series. Designed for ${category.toLowerCase()} and everyday comfort, these sneakers feature premium materials and iconic silhouettes. Built for those who lead, not follow.`,
      images: shuffledImages,
      sizes: [38, 39, 40, 41, 42, 43, 44, 45, 46],
      stock,
      salesCount: Math.floor(Math.random() * 500),
      featured: i < 20,
      trending: Math.random() > 0.7,
      rating: (Math.random() * (5 - 4.4) + 4.4).toFixed(1),
      reviews: Math.floor(Math.random() * 300) + 20
    });
  }
  return products;
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sneakerstore');
    await Product.deleteMany();
    await Product.insertMany(generateRealisticProducts());
    console.log('✅ MASSIVE SEED 4.0 SUCCESS: 210 Professional Products Created');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();

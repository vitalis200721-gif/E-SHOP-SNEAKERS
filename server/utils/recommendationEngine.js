/**
 * Simple Content-Based Filtering Algorithm
 * Calculates similarity between a source product and potential candidates.
 */
const calculateSimilarity = (source, target) => {
  let score = 0;

  // 1. Same Category (Highest Weight)
  if (source.category === target.category) score += 5;

  // 2. Same Brand
  if (source.brand === target.brand) score += 3;

  // 3. Price Proximity (Within 20% range)
  const priceDiff = Math.abs(source.price - target.price);
  const priceThreshold = source.price * 0.2;
  if (priceDiff <= priceThreshold) score += 2;

  return score;
};

const getRecommendations = (sourceProduct, allProducts, limit = 4) => {
  return allProducts
    .filter(p => p._id.toString() !== sourceProduct._id.toString()) // Exclude current product
    .map(p => ({
      product: p,
      score: calculateSimilarity(sourceProduct, p)
    }))
    .sort((a, b) => b.score - a.score) // Sort by highest similarity
    .slice(0, limit)
    .map(item => item.product);
};

module.exports = { getRecommendations };

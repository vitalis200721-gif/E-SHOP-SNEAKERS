/**
 * Simple mock AI recommendation engine
 * In a real app, this would use a recommendation model or collaborative filtering.
 */

export const getRecommendations = (currentProduct, allProducts) => {
  if (!currentProduct) return allProducts.slice(0, 4);

  // Simple heuristic: same brand or same category
  const recommendations = allProducts.filter(p => 
    p.id !== currentProduct.id && 
    (p.brand === currentProduct.brand || p.category === currentProduct.category)
  );

  // Return top 4
  return recommendations.length > 0 ? recommendations.slice(0, 4) : allProducts.slice(0, 4);
};

export const getPersonalizedFeed = (userHistory, allProducts) => {
  // If no history, return trending/featured
  if (!userHistory || userHistory.length === 0) {
    return allProducts.filter(p => p.featured).slice(0, 8);
  }

  // Find most frequent brand in history
  const brands = userHistory.map(p => p.brand);
  const topBrand = brands.sort((a,b) =>
      brands.filter(v => v===a).length - brands.filter(v => v===b).length
  ).pop();

  return allProducts.filter(p => p.brand === topBrand).slice(0, 8);
};

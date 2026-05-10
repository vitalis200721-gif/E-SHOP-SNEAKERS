'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

const RelatedProducts = ({ productId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const { data } = await axios.get(`/api/products/${productId}/recommendations`);
        setRecommendations(data);
      } catch (err) {
        console.error('Failed to fetch recommendations');
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchRecommendations();
  }, [productId]);

  if (loading) return <div className="h-40 flex items-center justify-center">Analyzing styles...</div>;
  if (recommendations.length === 0) return null;

  return (
    <section className="mt-32">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">YOU MIGHT ALSO LIKE</h2>
          <p className="text-premium-500 mt-2">AI-powered recommendations based on your style.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {recommendations.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;

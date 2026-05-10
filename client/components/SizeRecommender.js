'use client';
import { useState } from 'react';
import { recommendSize } from '@/utils/aiFeatures';
import { Info, Sparkles } from 'lucide-react';

const SizeRecommender = ({ targetBrand }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentBrand, setCurrentBrand] = useState('Nike');
  const [currentSize, setCurrentSize] = useState(42);
  const [recommendation, setRecommendation] = useState(null);

  const handleRecommend = () => {
    const result = recommendSize(currentBrand, currentSize, targetBrand);
    setRecommendation(result);
  };

  return (
    <div className="mt-8">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-bold text-accent hover:underline transition-all"
      >
        <Sparkles size={16} />
        Find My Perfect Size
      </button>

      {isOpen && (
        <div className="mt-4 p-6 border border-premium-200 dark:border-premium-800 rounded-2xl bg-premium-50 dark:bg-premium-900/50">
          <h4 className="font-bold mb-4 text-sm">Tell us what you wear now:</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <select 
              value={currentBrand}
              onChange={(e) => setCurrentBrand(e.target.value)}
              className="p-3 rounded-xl bg-white dark:bg-black border border-premium-200 dark:border-premium-800 text-sm outline-none"
            >
              <option>Nike</option>
              <option>Adidas</option>
              <option>Jordan</option>
              <option>New Balance</option>
              <option>Puma</option>
            </select>
            <input 
              type="number"
              value={currentSize}
              onChange={(e) => setCurrentSize(e.target.value)}
              className="p-3 rounded-xl bg-white dark:bg-black border border-premium-200 dark:border-premium-800 text-sm outline-none"
              placeholder="Size (EU)"
            />
          </div>
          <button 
            onClick={handleRecommend}
            className="w-full py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold text-sm hover:bg-accent hover:text-white transition-all"
          >
            Calculate Size
          </button>

          {recommendation && (
            <div className="mt-6 p-4 bg-white dark:bg-black rounded-xl border border-accent/20 flex gap-4 items-center animate-in fade-in slide-in-from-top-2">
              <div className="text-3xl font-black text-accent">{recommendation.size}</div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-premium-400">Recommended Size</p>
                <p className="text-xs text-premium-500">Based on your {currentBrand} fit ({recommendation.fitNote}).</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SizeRecommender;

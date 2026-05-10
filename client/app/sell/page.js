'use client';
import { useState } from 'react';
import { Upload, DollarSign, Info, CheckCircle, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

export default function SellPage() {
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Nike',
    price: '',
    description: '',
    condition: 'New',
    category: 'Lifestyle',
    image: ''
  });

  const onDrop = async (acceptedFiles) => {
    setUploading(true);
    const file = acceptedFiles[0];
    const data = new FormData();
    data.append('image', file);

    try {
      const res = await axios.post('/api/products/upload', data);
      setFormData({ ...formData, image: res.data.url });
      setStep(3); // Move to next step after upload
    } catch (err) {
      alert('Upload failed. Check Cloudinary credentials in .env');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 });

  const submitProduct = async () => {
    try {
      await axios.post('/api/products', formData);
      setStep(4);
    } catch (err) {
      alert('Error listing product.');
    }
  };

  return (
    <div className="bg-white dark:bg-black min-h-screen">
      <div className="pt-32 max-w-3xl mx-auto px-4 pb-20">
        <div className="bg-white dark:bg-premium-900 border border-premium-200 dark:border-premium-800 rounded-3xl p-8 shadow-xl">
          {step === 1 && (
            <div className="space-y-6">
              <h1 className="text-3xl font-black">1. DETAILS</h1>
              <input type="text" placeholder="Sneaker Name" className="w-full p-4 rounded-xl border border-premium-200 dark:border-premium-800 bg-transparent" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <input type="number" placeholder="Price ($)" className="w-full p-4 rounded-xl border border-premium-200 dark:border-premium-800 bg-transparent" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
              <textarea placeholder="Description" className="w-full p-4 rounded-xl border border-premium-200 dark:border-premium-800 bg-transparent" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              <button onClick={() => setStep(2)} className="w-full btn-premium py-4">Continue to Photos</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h1 className="text-3xl font-black">2. PHOTOS</h1>
              <div {...getRootProps()} className="border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer hover:border-accent transition-all">
                <input {...getInputProps()} />
                {uploading ? <Loader2 className="animate-spin mx-auto" /> : <Upload className="mx-auto mb-4" />}
                <p className="font-bold">Click or drag image to upload</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h1 className="text-3xl font-black">3. PREVIEW</h1>
              <div className="aspect-square rounded-2xl overflow-hidden bg-premium-100">
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <p className="font-bold text-xl">{formData.name} - ${formData.price}</p>
              <button onClick={submitProduct} className="w-full btn-premium py-4">List Sneaker for Sale</button>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-10 space-y-4">
              <CheckCircle size={60} className="text-green-500 mx-auto" />
              <h1 className="text-3xl font-black">SUCCESSFULLY LISTED</h1>
              <p className="text-premium-500">Your sneakers are now live on the marketplace!</p>
              <a href="/shop" className="btn-premium inline-block">Go to Shop</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

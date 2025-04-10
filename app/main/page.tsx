// pages/index.tsx
'use client'
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/generate-images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text(); // Get the error message
        console.error('Server Error:', errorText);
        throw new Error(errorText);
      }
      

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated_images.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert('Failed to generate images');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Upload Excel to Generate Images</h1>
      <input type="file" accept=".xlsx" onChange={handleUpload} />
      {loading && <p className="mt-4 text-blue-600">Generating images, please wait...</p>}
    </div>
  );
}

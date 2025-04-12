// pages/index.tsx
"use client";
import { useState } from "react";
import { useRef } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/format-1", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text(); // Get the error message
        console.error("Server Error:", errorText);
        throw new Error(errorText);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "generated_images.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert("Failed to generate images");
    } finally {
      setLoading(false);
      // ✅ Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">
        Upload Excel to Generate Images
        <a className="ml-3" href="/demo/Updated_create-image.xlsx" download>
          <button className="bg-blue-500 text-base px-2 py-1 rounded text-white  cursor-pointer">
            Download Sample File
          </button>
        </a>
      </h1>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        onChange={handleUpload}
      />

      {loading && (
        <p className="mt-4 text-blue-600">Generating images, please wait...</p>
      )}
    </div>
  );
}

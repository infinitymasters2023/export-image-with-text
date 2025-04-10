// 'use client';

// import {  useRef, useState } from 'react';
// import JSZip from 'jszip';
// import { saveAs } from 'file-saver';

// const demoData = [
//   {
//     image: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d',
//     text: 'Beautiful Mountain',
//   },
//   {
//     image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
//     text: 'Calm Lake',
//   },
//   {
//     image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b',
//     text: 'Serene Forest',
//   },
// ];

// export default function BatchImageExport() {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [processing, setProcessing] = useState(false);

//   const drawImageWithText = (
//     imageUrl: string,
//     text: string
//   ): Promise<string> => {
//     return new Promise((resolve) => {
//       const canvas = canvasRef.current!;
//       const ctx = canvas.getContext('2d')!;
//       const img = new Image();
//       img.crossOrigin = 'anonymous';
//       img.src = imageUrl;

//       img.onload = () => {
//         canvas.width = img.width;
//         canvas.height = img.height;
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         ctx.drawImage(img, 0, 0);

//         ctx.font = 'bold 48px Inter, sans-serif';
//         ctx.fillStyle = 'white';
//         ctx.strokeStyle = 'black';
//         ctx.lineWidth = 2;
//         ctx.textAlign = 'center';

//         const x = canvas.width / 2;
//         const y = canvas.height - 50;
//         ctx.strokeText(text, x, y);
//         ctx.fillText(text, x, y);

//         const dataURL = canvas.toDataURL('image/png');
//         resolve(dataURL);
//       };
//     });
//   };

//   const downloadAllAsZip = async () => {
//     setProcessing(true);
//     const zip = new JSZip();

//     for (let i = 0; i < demoData.length; i++) {
//       const { image, text } = demoData[i];
//       const dataUrl = await drawImageWithText(image, text);

//       // Convert dataURL to Blob
//       const res = await fetch(dataUrl);
//       const blob = await res.blob();

//       zip.file(`image_${i + 1}.png`, blob);
//     }

//     const content = await zip.generateAsync({ type: 'blob' });
//     saveAs(content, 'images_with_text.zip');
//     setProcessing(false);
//   };

//   return (
//     <div className="flex flex-col items-center p-6 gap-6">
//       <h1 className="text-2xl font-bold">Batch Export Images with Text</h1>

//       <canvas ref={canvasRef} className="hidden" />

//       <button
//         onClick={downloadAllAsZip}
//         disabled={processing}
//         className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
//       >
//         {processing ? 'Processing...' : 'Download All as ZIP'}
//       </button>
//     </div>
//   );
// }
// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import JSZip from 'jszip';
// import { saveAs } from 'file-saver';

// const demoData = [
//   {
//     image: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d',
//     text: 'Beautiful Mountain',
//   },
//   {
//     image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
//     text: 'Calm Lake',
//   },
//   {
//     image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b',
//     text: 'Serene Forest',
//   },
// ];

// export default function ImageOverlayPreview() {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [previews, setPreviews] = useState<string[]>([]);
//   const [processing, setProcessing] = useState(false);

//   const drawImageWithText = (
//     imageUrl: string,
//     text: string
//   ): Promise<string> => {
//     return new Promise((resolve) => {
//       const canvas = canvasRef.current!;
//       const ctx = canvas.getContext('2d')!;
//       const img = new Image();
//       img.crossOrigin = 'anonymous';
//       img.src = imageUrl;

//       img.onload = () => {
//         canvas.width = img.width;
//         canvas.height = img.height;
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         ctx.drawImage(img, 0, 0);

//         ctx.font = 'bold 48px Inter, sans-serif';
//         ctx.fillStyle = 'white';
//         ctx.strokeStyle = 'black';
//         ctx.lineWidth = 2;
//         ctx.textAlign = 'center';

//         const x = canvas.width / 2;
//         const y = canvas.height - 50;
//         ctx.strokeText(text, x, y);
//         ctx.fillText(text, x, y);

//         const dataURL = canvas.toDataURL('image/png');
//         resolve(dataURL);
//       };
//     });
//   };

//   const preparePreviews = async () => {
//     const allPreviews: string[] = [];
//     for (const { image, text } of demoData) {
//       const dataUrl = await drawImageWithText(image, text);
//       allPreviews.push(dataUrl);
//     }
//     setPreviews(allPreviews);
//   };

//   useEffect(() => {
//     preparePreviews();
//   }, []);

//   const downloadAllAsZip = async () => {
//     setProcessing(true);
//     const zip = new JSZip();

//     for (let i = 0; i < previews.length; i++) {
//       const dataUrl = previews[i];
//       const res = await fetch(dataUrl);
//       const blob = await res.blob();
//       zip.file(`image_${i + 1}.png`, blob);
//     }

//     const content = await zip.generateAsync({ type: 'blob' });
//     saveAs(content, 'images_with_text.zip');
//     setProcessing(false);
//   };

//   return (
//     <div className="p-6 flex flex-col items-center gap-6">
//       <h1 className="text-2xl font-bold">Image Preview with Text Overlay</h1>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//         {previews.map((src, i) => (
//           <img
//             key={i}
//             src={src}
//             alt={`preview-${i}`}
//             className="w-full max-w-xs border rounded shadow"
//           />
//         ))}
//       </div>

//       <canvas ref={canvasRef} className="hidden" />

//       <button
//         onClick={downloadAllAsZip}
//         disabled={processing || previews.length === 0}
//         className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
//       >
//         {processing ? 'Zipping...' : 'Download All as ZIP'}
//       </button>
//     </div>
//   );
// }
// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import JSZip from 'jszip';
// import { saveAs } from 'file-saver';

// const demoData = [
//   {
//     image: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d',
//     text: 'Beautiful Mountain',
//   },
//   {
//     image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
//     text: 'Calm Lake',
//   },
//   {
//     image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b',
//     text: 'Serene Forest',
//   },
// ];

// export default function ImageOverlayPreview() {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [previews, setPreviews] = useState<string[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [processing, setProcessing] = useState(false);

//   const drawImageWithText = (
//     imageUrl: string,
//     text: string
//   ): Promise<string> => {
//     return new Promise((resolve) => {
//       const canvas = canvasRef.current!;
//       const ctx = canvas.getContext('2d')!;
//       const img = new Image();
//       img.crossOrigin = 'anonymous';
//       img.src = imageUrl;

//       img.onload = () => {
//         canvas.width = img.width;
//         canvas.height = img.height;
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         ctx.drawImage(img, 0, 0);

//         ctx.font = 'bold 48px Inter, sans-serif';
//         ctx.fillStyle = 'white';
//         ctx.strokeStyle = 'black';
//         ctx.lineWidth = 2;
//         ctx.textAlign = 'center';

//         const x = canvas.width / 2;
//         const y = canvas.height - 50;
//         ctx.strokeText(text, x, y);
//         ctx.fillText(text, x, y);

//         const dataURL = canvas.toDataURL('image/png');
//         resolve(dataURL);
//       };
//     });
//   };

//   const preparePreviews = async () => {
//     setLoading(true);
//     const previewPromises = demoData.map(({ image, text }) =>
//       drawImageWithText(image, text)
//     );
//     const allPreviews = await Promise.all(previewPromises);
//     setPreviews(allPreviews);
//     setLoading(false);
//   };

//   useEffect(() => {
//     preparePreviews();
//   }, []);

//   const downloadAllAsZip = async () => {
//     setProcessing(true);
//     const zip = new JSZip();

//     const blobPromises = previews.map(async (dataUrl, i) => {
//       const res = await fetch(dataUrl);
//       const blob = await res.blob();
//       zip.file(`image_${i + 1}.png`, blob);
//     });

//     await Promise.all(blobPromises);

//     const content = await zip.generateAsync({ type: 'blob' });
//     saveAs(content, 'images_with_text.zip');
//     setProcessing(false);
//   };

//   return (
//     <div className="p-6 flex flex-col items-center gap-6">
//       <h1 className="text-2xl font-bold">Image Preview with Text Overlay</h1>

//       {loading ? (
//         <p className="text-gray-500 animate-pulse">Generating previews...</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {previews.map((src, i) => (
//             <img
//               key={i}
//               src={src}
//               alt={`preview-${i}`}
//               className="w-full max-w-xs border rounded shadow"
//             />
//           ))}
//         </div>
//       )}

//       <canvas ref={canvasRef} className="hidden" />

//       <button
//         onClick={downloadAllAsZip}
//         disabled={processing || loading || previews.length === 0}
//         className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
//       >
//         {processing ? 'Zipping...' : 'Download All as ZIP'}
//       </button>
//     </div>
//   );
// }
"use client";

import { useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

type ImageTextItem = {
  image: string;
  text: string;
};

export default function ImageOverlayExcel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<ImageTextItem[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const drawImageWithText = (
    imageUrl: string,
    text: string
  ): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        ctx.font = "bold 48px Inter, sans-serif";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.textAlign = "center";

        const x = canvas.width / 2;
        const y = canvas.height - 50;
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);

        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };
    });
  };

  const preparePreviews = async () => {
    if (data.length === 0) return;
    setLoading(true);
    const previewPromises = data.map(({ image, text }) =>
      drawImageWithText(image, text)
    );
    const allPreviews = await Promise.all(previewPromises);
    setPreviews(allPreviews);
    setLoading(false);
  };

  useEffect(() => {
    preparePreviews();
  }, [data]);

  const downloadAllAsZip = async () => {
    setProcessing(true);
    const zip = new JSZip();

    const blobPromises = previews.map(async (dataUrl, i) => {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      zip.file(`image_${i + 1}.png`, blob);
    });

    await Promise.all(blobPromises);

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "images_with_text.zip");
    setProcessing(false);
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData: ImageTextItem[] = XLSX.utils.sheet_to_json(sheet);
      setData(parsedData);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-6 flex flex-col items-center gap-6">
      <div className="flex items-center gap-12">
        <h1 className="text-2xl font-bold">Excel Upload + Image Overlay</h1>
        <button
          onClick={downloadAllAsZip}
          disabled={processing || loading || previews.length === 0}
          className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {processing ? "Zipping..." : "Download All as ZIP"}
        </button>
      </div>
      <div>
        <div className="w-[26rem] py-9 bg-gray-50 rounded-2xl border border-gray-300 gap-3 grid border-dashed">
          <div className="grid gap-1">
            <svg
              className="mx-auto"
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="File">
                <path
                  id="icon"
                  d="M31.6497 10.6056L32.2476 10.0741L31.6497 10.6056ZM28.6559 7.23757L28.058 7.76907L28.058 7.76907L28.6559 7.23757ZM26.5356 5.29253L26.2079 6.02233L26.2079 6.02233L26.5356 5.29253ZM33.1161 12.5827L32.3683 12.867V12.867L33.1161 12.5827ZM31.8692 33.5355L32.4349 34.1012L31.8692 33.5355ZM24.231 11.4836L25.0157 11.3276L24.231 11.4836ZM26.85 14.1026L26.694 14.8872L26.85 14.1026ZM11.667 20.8667C11.2252 20.8667 10.867 21.2248 10.867 21.6667C10.867 22.1085 11.2252 22.4667 11.667 22.4667V20.8667ZM25.0003 22.4667C25.4422 22.4667 25.8003 22.1085 25.8003 21.6667C25.8003 21.2248 25.4422 20.8667 25.0003 20.8667V22.4667ZM11.667 25.8667C11.2252 25.8667 10.867 26.2248 10.867 26.6667C10.867 27.1085 11.2252 27.4667 11.667 27.4667V25.8667ZM20.0003 27.4667C20.4422 27.4667 20.8003 27.1085 20.8003 26.6667C20.8003 26.2248 20.4422 25.8667 20.0003 25.8667V27.4667ZM23.3337 34.2H16.667V35.8H23.3337V34.2ZM7.46699 25V15H5.86699V25H7.46699ZM32.5337 15.0347V25H34.1337V15.0347H32.5337ZM16.667 5.8H23.6732V4.2H16.667V5.8ZM23.6732 5.8C25.2185 5.8 25.7493 5.81639 26.2079 6.02233L26.8633 4.56274C26.0191 4.18361 25.0759 4.2 23.6732 4.2V5.8ZM29.2539 6.70608C28.322 5.65771 27.7076 4.94187 26.8633 4.56274L26.2079 6.02233C26.6665 6.22826 27.0314 6.6141 28.058 7.76907L29.2539 6.70608ZM34.1337 15.0347C34.1337 13.8411 34.1458 13.0399 33.8638 12.2984L32.3683 12.867C32.5216 13.2702 32.5337 13.7221 32.5337 15.0347H34.1337ZM31.0518 11.1371C31.9238 12.1181 32.215 12.4639 32.3683 12.867L33.8638 12.2984C33.5819 11.5569 33.0406 10.9662 32.2476 10.0741L31.0518 11.1371ZM16.667 34.2C14.2874 34.2 12.5831 34.1983 11.2872 34.0241C10.0144 33.8529 9.25596 33.5287 8.69714 32.9698L7.56577 34.1012C8.47142 35.0069 9.62375 35.4148 11.074 35.6098C12.5013 35.8017 14.3326 35.8 16.667 35.8V34.2ZM5.86699 25C5.86699 27.3344 5.86529 29.1657 6.05718 30.593C6.25217 32.0432 6.66012 33.1956 7.56577 34.1012L8.69714 32.9698C8.13833 32.411 7.81405 31.6526 7.64292 30.3798C7.46869 29.0839 7.46699 27.3796 7.46699 25H5.86699ZM23.3337 35.8C25.6681 35.8 27.4993 35.8017 28.9266 35.6098C30.3769 35.4148 31.5292 35.0069 32.4349 34.1012L31.3035 32.9698C30.7447 33.5287 29.9863 33.8529 28.7134 34.0241C27.4175 34.1983 25.7133 34.2 23.3337 34.2V35.8ZM32.5337 25C32.5337 27.3796 32.532 29.0839 32.3577 30.3798C32.1866 31.6526 31.8623 32.411 31.3035 32.9698L32.4349 34.1012C33.3405 33.1956 33.7485 32.0432 33.9435 30.593C34.1354 29.1657 34.1337 27.3344 34.1337 25H32.5337ZM7.46699 15C7.46699 12.6204 7.46869 10.9161 7.64292 9.62024C7.81405 8.34738 8.13833 7.58897 8.69714 7.03015L7.56577 5.89878C6.66012 6.80443 6.25217 7.95676 6.05718 9.40704C5.86529 10.8343 5.86699 12.6656 5.86699 15H7.46699ZM16.667 4.2C14.3326 4.2 12.5013 4.1983 11.074 4.39019C9.62375 4.58518 8.47142 4.99313 7.56577 5.89878L8.69714 7.03015C9.25596 6.47133 10.0144 6.14706 11.2872 5.97592C12.5831 5.8017 14.2874 5.8 16.667 5.8V4.2ZM23.367 5V10H24.967V5H23.367ZM28.3337 14.9667H33.3337V13.3667H28.3337V14.9667ZM23.367 10C23.367 10.7361 23.3631 11.221 23.4464 11.6397L25.0157 11.3276C24.9709 11.1023 24.967 10.8128 24.967 10H23.367ZM28.3337 13.3667C27.5209 13.3667 27.2313 13.3628 27.0061 13.318L26.694 14.8872C27.1127 14.9705 27.5976 14.9667 28.3337 14.9667V13.3667ZM23.4464 11.6397C23.7726 13.2794 25.0543 14.5611 26.694 14.8872L27.0061 13.318C26.0011 13.1181 25.2156 12.3325 25.0157 11.3276L23.4464 11.6397ZM11.667 22.4667H25.0003V20.8667H11.667V22.4667ZM11.667 27.4667H20.0003V25.8667H11.667V27.4667ZM32.2476 10.0741L29.2539 6.70608L28.058 7.76907L31.0518 11.1371L32.2476 10.0741Z"
                  fill="#4F46E5"
                />
              </g>
            </svg>
            <h2 className="text-center text-gray-400   text-xs leading-4">
              PNG, JPG or PDF, smaller than 15MB
            </h2>
          </div>
          <div className="grid gap-2">
            <h4 className="text-center text-gray-900 text-sm font-medium leading-snug">
              Drag and Drop your file here or
            </h4>
            <div className="flex items-center justify-center">
              <label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleExcelUpload}
                  hidden
                />
                <div className="flex w-28 h-9 px-2 flex-col bg-indigo-600 rounded-full shadow text-white text-xs font-semibold leading-4 items-center justify-center cursor-pointer focus:outline-none">
                  Choose File
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleExcelUpload}
        className="mb-4 border"
      /> */}

      {loading ? (
        <p className="text-gray-500 animate-pulse">Generating previews...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {previews.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`preview-${i}`}
              className="w-full max-w-xs border rounded shadow"
            />
          ))}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

// /app/api/generate-images/route.ts

import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import fetch from "node-fetch";
import sharp from "sharp";
import JSZip from "jszip";
import { writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { readFileSync } from "fs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const tempFilePath = join(tmpdir(), `${Date.now()}-${file.name}`);
    await writeFile(tempFilePath, buffer);

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<{
      Image: string;
      Text: string;
      TextFontSize: string;
      FontWeight: string;
      Price?: number;
      Brand?: string;
      Color?: string;
      PriceColor?: string;
      PriceFontSize?: string;
      BrandColor?: string;
      BrandFontSize?: string;
      FontFamily?: string;
    }>(sheet);

    if (!rows.length) {
      return NextResponse.json(
        { message: "Excel file is empty or improperly formatted" },
        { status: 400 }
      );
    }

    const zip = new JSZip();

    await Promise.all(
      rows.map(async (row, index) => {
        try {
          if (!row.Image || !row.Text) {
            console.warn(`Row ${index + 1} missing image or text. Skipping...`);
            return;
          }

          const response = await fetch(row.Image, {
            headers: {
              "User-Agent": "Mozilla/5.0",
            },
          });

          if (!response.ok) {
            console.warn(
              `Failed to fetch image URL at row ${index + 1}: ${row.Image}`
            );
            return;
          }

          const imageBuffer = await response.buffer();

          //calculating image size
          const metadata = await sharp(imageBuffer).metadata();
          const width = metadata.width ?? 500;
          const height = metadata.height ?? 500;

          //defining font familyh
          const fontFamily = row?.FontFamily || "WinkyRough-Black";
          const fontPath = join(process.cwd(), "fonts", `${fontFamily}.ttf`);
          const fontData = readFileSync(fontPath).toString("base64");
          console.log("fontpath: ",fontFamily.split('-')?.[0]);

          //indian currency formatting
          const formattedPrice = new Intl.NumberFormat("en-IN").format(
            row?.Price as number
          );
          const priceWithCurrency = `₹${formattedPrice}`;

          //Main text
          const lines = row.Text.split(/\r\n|\r|\n/);
          const tspanElements = lines
            .map(
              (line, i) => `
  <tspan x="50%" dy="${i === 0 ? 0 : 110}" text-anchor="middle">${line}</tspan>
`
            )
            .join("");

          //creating svg to add on image
          const svgText = `
  <svg width="${width}" height="${height}">
  <defs>
      <style type="text/css">
        @font-face {
          font-family: '${fontFamily}';
           src: url('data:font/ttf;base64,${fontData}') format('truetype');
           font-weight: ${row?.FontWeight};
           font-display: swap;
        }
        .text {
          font-family: '${fontFamily}';
          font-size: ${row?.TextFontSize};
          font-weight:  ${row?.FontWeight};
        }
             .price {
          font-family: '${fontFamily}';
          font-size: ${row?.PriceFontSize};
          font-weight: ${row?.FontWeight};
        }
             .brand {
          font-family: '${fontFamily}';
          font-size: ${row?.BrandFontSize};
          font-weight:  ${row?.FontWeight};
        }
      </style>
    </defs>
    <rect width="100%" height="100%" fill="transparent"/>
     <text 
      x="50%" 
      y="887" 
      text-anchor="middle" 
      dominant-baseline="middle"
       class="text"
         fill="${row?.Color}"
       >
     ${tspanElements}
    </text>
     <text 
      x="50%" 
      y="100" 
      text-anchor="middle" 
      dominant-baseline="middle"
       class="price"
         fill="${row?.PriceColor || row?.Color}"
       >
     ${priceWithCurrency}
    </text>
     <text 
      x="50%" 
      y="500" 
      text-anchor="middle" 
      dominant-baseline="middle"
       class="brand"
       fill="${row?.BrandColor || row?.Color}"
       >
     ${row.Brand}
    </text>
  </svg>`;
  

          const finalImage = await sharp(imageBuffer)
            .composite([{ input: Buffer.from(svgText), top: 0, left: 0 }])
            .png()
            .toBuffer();

          zip.file(`image_${index + 1}.png`, finalImage);
        } catch (err) {
          console.error(`Error processing row ${index + 1}:`, err);
        }
      })
    );

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=generated_images.zip",
      },
    });
  } catch (error) {
    console.error("Fatal error:", error);
    return NextResponse.json(
      { message: "Something went wrong while processing your file." },
      { status: 500 }
    );
  }
}

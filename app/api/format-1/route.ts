export const runtime = "nodejs";
import fetch from "node-fetch";
import { NextRequest, NextResponse } from "next/server";
import { createCanvas, loadImage, Image } from "canvas";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

async function safeLoadImageFromUrl(url: string): Promise<Image | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
    const buffer = await res.buffer();
    return await loadImage(buffer);
  } catch (error) {
    console.error("safeLoadImageFromUrl error:", error);
    return null;
  }
}

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
      Logo: string;
      ProductImage: string;
      Brand: string;
      Price: string;
      Text: string;
      ImageFileName: string;
      PriceColor: string;
      BrandColor: string;
      TextColor: string;
      PriceBackgroundColor: string;
      TextBackgroundColor: string;
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
          // Create a canvas
          const width = 1500;
          const height = 1500;
          const canvas = createCanvas(width, height);
          const ctx = canvas.getContext("2d");

          ctx.font = "bold 60px Sans";
          // Draw background
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);

          // Draw text
          ctx.fillStyle = "#000000";
          ctx.textAlign = "center";
          const logoImage = await safeLoadImageFromUrl(row.Logo);
          if (logoImage) {
            ctx.drawImage(logoImage, (width - 700) / 2, 50, 700, 700);
          } else {
            ctx.fillText("Failed to load logo", 50, 300);
          }

          ctx.textAlign = "left";
          const ProductImage = await safeLoadImageFromUrl(row.ProductImage);
          if (ProductImage) {
            ctx.drawImage(ProductImage, 900, 600, 400, 400);
          } else {
            ctx.fillText("Failed to load logo", 50, 300);
          }

          // Set common font
          ctx.font = "bold 100px Sans"; // You can change size/font per line too
          ctx.textAlign = "center";
          // First line in red
          ctx.fillStyle = row.TextBackgroundColor || "#e63946";
          ctx.fillRect(0, 1000, width, 130);
          ctx.fillStyle = row.TextColor || "#FCD34D";
          ctx.fillText(row.Text, width / 2, 1100);

          ctx.font = "bold 90px Sans";
          ctx.fillStyle = row.BrandColor || "#457b9d";
          ctx.textAlign = "center";
          ctx.fillText(row.Brand, width / 2, 1275);

          // Third line in green
          ctx.fillStyle = row.PriceBackgroundColor || "#7C3AED";
          ctx.fillRect(0, 1350, width, 130);

          ctx.font = "bold 100px Sans";
          ctx.fillStyle = row.PriceColor || "#FCD34D";
          ctx.fillText(row.Price, width / 2, 1450);

          // Export as PNG
          const buffer1 = canvas.toBuffer("image/jpeg");

          const imageFileName = `Image_${index + 1}.jpeg`;
          row.ImageFileName = imageFileName;

          zip.file(imageFileName, buffer1);
        } catch (err) {
          console.error(`Error processing row ${index + 1}:`, err);
        }
      })
    );


    const updatedSheet = XLSX.utils.json_to_sheet(rows);
    const updatedWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(updatedWorkbook, updatedSheet, "Sheet1");

    const excelBuffer = XLSX.write(updatedWorkbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    zip.file("Updated_"+file.name, excelBuffer);

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

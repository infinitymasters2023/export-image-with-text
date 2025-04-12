export const runtime = "nodejs";
import fetch from "node-fetch";
import { NextRequest, NextResponse } from "next/server";
import { createCanvas, loadImage, Image } from "canvas";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { uploadBufferToAzure } from "@/app/lib/azureBlob";

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
      BrandBackgroundColor: string;
      TextFontSize: number;
      BrandFontSize: number;
      PriceFontSize: number;
      TextFontWeight: number;
      BrandFontWeight: number;
      PriceFontWeight: number;
      FontFamily: string;
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

          const fontWeightText = row?.TextFontWeight || 700; // Any number from 100 to 900
          const fontSizeText = `${row?.TextFontSize || 100}px`;
          const fontFamilyText = row?.FontFamily || "Sans";
          const fontText = `${fontWeightText} ${fontSizeText} ${fontFamilyText}`;

          const fontWeightBrand = row?.BrandFontWeight || 700; // Any number from 100 to 900
          const fontSizeBrand = `${row?.BrandFontSize || 90}px`;
          const fontFamilyBrand = row?.FontFamily || "Sans";
          const fontBrand = `${fontWeightBrand} ${fontSizeBrand} ${fontFamilyBrand}`;

          const fontWeightPrice = row?.PriceFontWeight || 700; // Any number from 100 to 900
          const fontSizePrice = `${row?.PriceFontSize || 90}px`;
          const fontFamilyPrice = row?.FontFamily || "Sans";
          const fontPrice = `${fontWeightPrice} ${fontSizePrice} ${fontFamilyPrice}`;

          // Draw background
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);


          // Draw Logo
          ctx.textAlign = "center";
          const logoImage = await safeLoadImageFromUrl(row.Logo);
          if (logoImage) {
            ctx.drawImage(logoImage, (width - 960) / 2, -50, 960, 1000);
          } else {
            ctx.fillText("Failed to load logo", 50, 300);
          }

          //Draw Product Image
          ctx.textAlign = "left";
          const ProductImage = await safeLoadImageFromUrl(row.ProductImage);
          if (ProductImage) {
            ctx.drawImage(ProductImage, 950, 650, 400, 400);
          } else {
            ctx.fillText("Failed to load logo", 50, 300);
          }

          // First line in red
          ctx.font = fontText; // You can change size/font per line too
          ctx.textAlign = "center";
          ctx.fillStyle = row.TextBackgroundColor || "#e63946";
          ctx.fillRect(0, 1050, width, 150);
          ctx.fillStyle = row.TextColor || "#FCD34D";
          ctx.fillText(row.Text, width / 2, 1160);

          //Second line
          ctx.font = fontBrand;
          ctx.fillStyle =  row.BrandBackgroundColor || "#e63946";
          ctx.fillRect(0, 1200, width, 150);
          ctx.fillStyle = row.BrandColor || "#457b9d";
          ctx.textAlign = "center";
          ctx.fillText(row.Brand, width / 2, 1310);

          // Third line in green
          ctx.font = fontPrice;
          ctx.textAlign = "center";
          ctx.fillStyle = row.PriceBackgroundColor || "#7C3AED";
          ctx.fillRect(0, 1350, width, 150);
          ctx.fillStyle = row.PriceColor || "#FCD34D";
          ctx.fillText(row.Price, width / 2, 1460);
          

          // Export as JPEG
          const buffer1 = canvas.toBuffer("image/jpeg");

          const imageFileName = `Image_${index + 1}.jpeg`;
          row.ImageFileName = imageFileName;

          // try {
          //   const imageUrl = await uploadBufferToAzure(buffer1, imageFileName, "image/jpeg");
          //   console.log("Image uploaded to Azure:", index+1);
          // } catch (uploadErr: any) {
          //   console.log("Azure upload failed: ", uploadErr.message);
          // }

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

    zip.file("Updated_" + file.name, excelBuffer);

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

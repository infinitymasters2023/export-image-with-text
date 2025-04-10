// /app/api/generate-images/route.ts

import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import fetch from "node-fetch";
import sharp from "sharp";
import JSZip from "jszip";
import { writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

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
    const rows = XLSX.utils.sheet_to_json<{ image: string; text: string }>(
      sheet
    );

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
          if (!row.image || !row.text) {
            console.warn(`Row ${index + 1} missing image or text. Skipping...`);
            return;
          }

          const response = await fetch(row.image, {
            headers: {
              "User-Agent": "Mozilla/5.0",
            },
          });

          if (!response.ok) {
            console.warn(
              `Failed to fetch image URL at row ${index + 1}: ${row.image}`
            );
            return;
          }

          const imageBuffer = await response.buffer();

          const metadata = await sharp(imageBuffer).metadata();
          const width = metadata.width ?? 500;
          const height = metadata.height ?? 500;

          const svgText = `
  <svg width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="transparent"/>
    <text x="50%" y="${
      height - 80
    }" font-size="60" fill="white" text-anchor="middle" dominant-baseline="middle">${
            row.text
          }</text>
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

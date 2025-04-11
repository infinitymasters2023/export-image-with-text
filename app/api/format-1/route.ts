import { NextRequest, NextResponse } from "next/server";
import { createCanvas, loadImage } from "canvas";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
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
  }>(sheet);

  if (!rows.length) {
    return NextResponse.json(
      { message: "Excel file is empty or improperly formatted" },
      { status: 400 }
    );
  }

  const zip = new JSZip();

  console.log("rows: ",rows)

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

        // Load and draw image
        try {
          const image = await loadImage(row?.Logo); // public image URL
          ctx.drawImage(image, 400, 50, 700, 700); // x, y, width, height
        } catch (err) {
          ctx.fillText("Failed to load image", 50, 300);
          console.error("Image load error:", err);
        }

        // Load and draw image
        try {
          const image = await loadImage(row?.ProductImage); // public image URL
          ctx.drawImage(image, 900, 600, 400, 400); // x, y, width, height
        } catch (err) {
          ctx.fillText("Failed to load image", 50, 300);
          console.error("Image load error:", err);
        }

        // Set common font
        ctx.font = "bold 100px Sans"; // You can change size/font per line too

        // First line in red
        ctx.fillStyle = "#e63946";
        ctx.fillRect(0, 1000, width, 130);
        ctx.fillStyle = "#FCD34D";
        ctx.fillText(row.Text, 50, 1100);

        ctx.fillStyle = "#457b9d";
        ctx.fillText(row.Brand, 100, 1275);

        // Third line in green
        ctx.fillStyle = "#7C3AED";
        ctx.fillRect(0, 1350, width, 130);

        ctx.fillStyle = "#FCD34D";
        ctx.fillText(row.Price, 50, 1450);

        // Export as PNG
        const buffer1 = canvas.toBuffer("image/png");

        console.log("created: ",index+1)
        zip.file(`image_${index + 1}.png`, buffer1);
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
}

"use client";
import React, { useEffect } from "react";

function page() {
  useEffect(() => {
    const width = 1500;
    const height = 1500;
    // Inside useEffect or onClick
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#e63946";
    ctx.fillText("1 Year Extended Warranty", 50, 1000);
  
    // Second line in blue
    ctx.fillStyle = "#457b9d";
    ctx.fillText("Televisions - All Brands", 50, 1200);
  
    // Third line in green
    ctx.fillStyle = "#2a9d8f";
    ctx.fillText("Priced Rs. 70,001 - 85,000", 50, 1400);
  }, []);
  return (
    <div className="bg-black flex justify-center">
      <canvas id="myCanvas" width={1500} height={1500}></canvas>
    </div>
  );
}

export default page;

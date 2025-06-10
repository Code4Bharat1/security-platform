import { NextResponse } from "next/server";
import * as formidable from "formidable";  // <-- change here
import fs from "fs/promises";

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY;

export const config = {
  api: {
    bodyParser: false,
  },
};

export const POST = async (req) => {
  try {
    const form = new formidable.IncomingForm();

    const data = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const file = data.files.file;

    if (!file) {
      return NextResponse.json({ error: "File not provided" }, { status: 400 });
    }

    const buffer = await fs.readFile(file.filepath);

    // Upload file buffer to VirusTotal
    const vtUploadResponse = await fetch("https://www.virustotal.com/api/v3/files", {
      method: "POST",
      headers: {
        "x-apikey": VIRUSTOTAL_API_KEY,
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
    });

    if (!vtUploadResponse.ok) {
      const errorData = await vtUploadResponse.json();
      return NextResponse.json({ error: errorData.error.message }, { status: vtUploadResponse.status });
    }

    const vtUploadData = await vtUploadResponse.json();
    const analysisId = vtUploadData.data.id;

    let analysisStatus = "queued";
    let analysisData;

    while (analysisStatus === "queued" || analysisStatus === "pending") {
      await new Promise((r) => setTimeout(r, 5000));
      const resultResponse = await fetch(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
        headers: { "x-apikey": VIRUSTOTAL_API_KEY },
      });

      if (!resultResponse.ok) {
        const errorData = await resultResponse.json();
        return NextResponse.json({ error: errorData.error.message }, { status: resultResponse.status });
      }

      analysisData = await resultResponse.json();
      analysisStatus = analysisData.data.attributes.status;
    }

    return NextResponse.json({
      message: "File scan completed",
      analysisId,
      status: analysisStatus,
      analysisData,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};

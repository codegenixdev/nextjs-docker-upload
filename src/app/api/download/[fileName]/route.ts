import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

type Params = Promise<{ fileName: string }>;

// Expanded list of allowed file types with their MIME types
const ALLOWED_TYPES: { [key: string]: string } = {
  // Images
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".bmp": "image/bmp",
  ".tiff": "image/tiff",

  // Documents
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".txt": "text/plain",
  ".csv": "text/csv",
  ".rtf": "application/rtf",

  // Archives
  ".zip": "application/zip",
  ".rar": "application/x-rar-compressed",
  ".7z": "application/x-7z-compressed",

  // Audio
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",

  // Video
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".avi": "video/x-msvideo",
  ".mov": "video/quicktime",

  // Other
  ".json": "application/json",
  ".xml": "application/xml",
};

// Increased max file size to 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const GET = async (_: NextRequest, { params }: { params: Params }) => {
  try {
    const { fileName } = await params;

    if (!fileName) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    const fileExt = path.extname(fileName).toLowerCase();
    if (!ALLOWED_TYPES[fileExt]) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "uploads", fileName);

    try {
      await fs.access(filePath);
    } catch (error) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const stats = await fs.stat(filePath);
    if (stats.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    const file = await fs.readFile(filePath);
    const contentType = ALLOWED_TYPES[fileExt];

    // Adjust Content-Disposition based on file type
    const disposition = isPreviewable(fileExt) ? "inline" : "attachment";

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${disposition}; filename="${encodeURIComponent(
          fileName
        )}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Security-Policy": "default-src 'self'",
        "X-Content-Type-Options": "nosniff",
        "Content-Length": stats.size.toString(),
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

// Helper function to determine if file type should be previewed in browser
function isPreviewable(fileExt: string): boolean {
  const previewableTypes = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".svg",
    ".pdf",
    ".txt",
    ".mp3",
    ".wav",
    ".mp4",
    ".webm",
  ];
  return previewableTypes.includes(fileExt.toLowerCase());
}

export { GET };

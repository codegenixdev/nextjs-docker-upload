import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { canShowInBrowser, getMimeTypeFromExtension } from "@/app/utils";
import { MAX_FILE_SIZE } from "@/app/constants";

type Params = Promise<{ fileName: string }>;

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
    const contentType = getMimeTypeFromExtension(fileExt);

    if (!contentType) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "uploads", fileName);

    try {
      await fs.access(filePath);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const stats = await fs.stat(filePath);
    if (stats.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    const file = await fs.readFile(filePath);

    const disposition = canShowInBrowser(fileExt) ? "inline" : "attachment";

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

export { GET };

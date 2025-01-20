preview final project

clone tutorial branch
run project and show

review all files tell what we want to change

```ts app/actions.ts
"use server";

import { ALLOWED_TYPES, MAX_FILE_SIZE, UPLOAD_DIR } from "@/app/constants";
import { isAllowedMimeType, sanitizeFileName } from "@/app/utils";
import fs from "fs/promises";
import { revalidatePath } from "next/cache";
import path from "path";

type UploadResult = {
  success: boolean;
  message: string;
  fileName?: string;
};

const upload = async (formData: FormData): Promise<UploadResult> => {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      return { success: false, message: "No file uploaded" };
    }

    if (!isAllowedMimeType(file.type)) {
      return {
        success: false,
        message: `File type not allowed. Allowed types: ${Object.keys(
          ALLOWED_TYPES
        ).join(", ")}`,
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        message: `File size too large. Maximum size: ${
          MAX_FILE_SIZE / (1024 * 1024)
        }MB`,
      };
    }

    const originalExtension = path.extname(file.name).toLowerCase();
    const allowedExtensions = ALLOWED_TYPES[file.type];

    if (!allowedExtensions.includes(originalExtension)) {
      return {
        success: false,
        message: `Invalid file extension. Expected: ${allowedExtensions.join(
          ", "
        )}`,
      };
    }

    const timestamp = Date.now();
    const safeFileName = `${timestamp}-${sanitizeFileName(file.name)}`;
    const filePath = path.join(UPLOAD_DIR, safeFileName);

    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await fs.writeFile(filePath, buffer);

    const stats = await fs.stat(filePath);
    if (stats.size !== file.size) {
      await fs.unlink(filePath);
      return { success: false, message: "File upload verification failed" };
    }

    revalidatePath("/");

    return {
      success: true,
      message: "File uploaded successfully",
      fileName: safeFileName,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};

export { upload };
```

```ts form.tsx
const [errorMessage, setErrorMessage] = useState<string | null>(null);

const handleUpload = async (formData: FormData) => {
  const result = await upload(formData);
  if (!result.success) {
    setErrorMessage(result.message);
  } else {
    setErrorMessage(null);
  }
};

// below maxfile size (and next div)
{
  errorMessage && <p className="text-[#ff5555]">{errorMessage}</p>;
}
```

```ts app/api/download/[fileName]/route.ts
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
```

```ts list.tsx
let files: string[] = [];

try {
  files = await fs.readdir("uploads");
} catch (error) {
  console.error(error);
  await fs.mkdir("uploads", { recursive: true });
}

const groupedFiles = groupFilesByType(files);
```

```ts route.ts
const deleteFile = async (fileName: string) => {
  try {
    const filePath = path.join("uploads", fileName);
    await fs.unlink(filePath);
    revalidatePath("/");
  } catch (error) {
    console.error("Delete error:", error);
  }
};

export { upload, deleteFile };
```

```ts list.tsx
const handleDelete = async (fileName: string) => {
  "use server";
  await deleteFile(fileName);
};
```

<!-- docker -->

```dockerfile
FROM node:22-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p ./public
RUN mkdir -p ./uploads

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN mkdir -p /app/uploads
RUN mkdir -p .next

COPY --from=builder /app/public ./public
COPY --from=builder /app/uploads ./uploads
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN chmod -R 777 /app
RUN chmod -R 777 /app/uploads
RUN chmod -R 777 .next

USER root

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

```

```yml docker-compose.yml
services:
  nextjs-docker-upload:
    build:
      context: .
    ports:
      - "3020:3000"
    volumes:
      - uploads:/app/uploads

volumes:
  uploads:
```

```.dockerignore
Dockerfile
.dockerignore
uploads
node_modules
npm-debug.log
README.md
.next
.git

```

```json package.json
		"docker": "docker compose up --build -d",

```

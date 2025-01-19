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

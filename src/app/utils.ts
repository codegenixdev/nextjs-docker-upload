import { ALLOWED_TYPES } from "@/app/constants";
import path from "path";

const sanitizeFileName = (fileName: string): string => {
  const name = path.basename(fileName);
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "_")
    .replace(/_+/g, "_");
};

const isAllowedMimeType = (
  type: string
): type is keyof typeof ALLOWED_TYPES => {
  return type in ALLOWED_TYPES;
};

const canShowInBrowser = (fileExt: string): boolean => {
  const browserViewableTypes = [
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
  return browserViewableTypes.includes(fileExt.toLowerCase());
};

const getMimeTypeFromExtension = (fileExt: string): string | null => {
  for (const [mimeType, extensions] of Object.entries(ALLOWED_TYPES)) {
    if (extensions.includes(fileExt.toLowerCase())) {
      return mimeType;
    }
  }
  return null;
};

const formatFileSize = (bytes: number): string => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
};

const getFileType = (extension: string): string => {
  const typeMap: Record<string, string> = {
    ".jpg": "image",
    ".jpeg": "image",
    ".png": "image",
    ".gif": "image",
    ".webp": "image",
    ".svg": "image",

    ".pdf": "document",
    ".doc": "document",
    ".docx": "document",
    ".xls": "document",
    ".xlsx": "document",
    ".txt": "document",
    ".csv": "document",

    ".mp3": "audio",
    ".wav": "audio",

    ".mp4": "video",
    ".webm": "video",
  };
  return typeMap[extension] || "other";
};

const groupFilesByType = (files: string[]) => {
  return files.reduce((acc, file) => {
    const ext = path.extname(file).toLowerCase();
    const type = getFileType(ext);
    if (!acc[type]) acc[type] = [];
    acc[type].push(file);
    return acc;
  }, {} as Record<string, string[]>);
};

export {
  formatFileSize,
  sanitizeFileName,
  groupFilesByType,
  isAllowedMimeType,
  getMimeTypeFromExtension,
  canShowInBrowser,
};

import path from "path";

const ALLOWED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
  "image/svg+xml": [".svg"],

  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  "text/plain": [".txt"],
  "text/csv": [".csv"],

  "application/zip": [".zip"],
  "application/x-rar-compressed": [".rar"],

  "audio/mpeg": [".mp3"],
  "audio/wav": [".wav"],

  "video/mp4": [".mp4"],
  "video/webm": [".webm"],
};

const getFileExtension = (fileName: string): string => {
  return path.extname(fileName).toLowerCase();
};

const formatFileSize = (bytes: number): string => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
};

const sanitizeFileName = (fileName: string): string => {
  const name = path.basename(fileName);

  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "_")
    .replace(/_+/g, "_");
};

const getFileType = (extension: string): string => {
  const typeMap: Record<string, string> = {
    ".jpg": "image",
    ".jpeg": "image",
    ".png": "image",
    ".gif": "image",
    ".webp": "image",
    ".pdf": "document",
    ".doc": "document",
    ".docx": "document",
    ".xls": "document",
    ".xlsx": "document",
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

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const UPLOAD_DIR = "uploads";

export {
  getFileExtension,
  formatFileSize,
  sanitizeFileName,
  getFileType,
  groupFilesByType,
  ALLOWED_TYPES,
  MAX_FILE_SIZE,
  UPLOAD_DIR,
};

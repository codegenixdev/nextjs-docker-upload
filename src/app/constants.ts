const ALLOWED_TYPES = {
  // image
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
  "image/svg+xml": [".svg"],

  // document
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

  // compressed
  "application/zip": [".zip"],
  "application/x-rar-compressed": [".rar"],
  "application/x-zip-compressed": [".zip"],
  "application/octet-stream": [".zip"],

  // audio
  "audio/mpeg": [".mp3"],
  "audio/wav": [".wav"],

  // video
  "video/mp4": [".mp4"],
  "video/webm": [".webm"],
};

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const UPLOAD_DIR = "uploads";

export { ALLOWED_TYPES, MAX_FILE_SIZE, UPLOAD_DIR };

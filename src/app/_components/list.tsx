import { deleteFile } from "@/app/actions";
import { groupFilesByType } from "@/app/utils";
import fs from "fs/promises";

import Image from "next/image";

const List = async () => {
  let files: string[] = [];

  try {
    files = await fs.readdir("uploads");
  } catch (error) {
    await fs.mkdir("uploads", { recursive: true });
  }

  const groupedFiles = groupFilesByType(files);

  const handleDelete = async (fileName: string) => {
    "use server";
    await deleteFile(fileName);
  };

  return (
    <>
      {Object.entries(groupedFiles).map(([type, typeFiles]) => (
        <div key={type} className="mb-8">
          <h2 className="text-xl font-semibold mb-4 capitalize">
            {type} Files
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {typeFiles.map((file) => (
              <div
                key={file}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.substring(file.indexOf("-") + 1)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(
                        parseInt(file.split("-")[0])
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <form action={handleDelete.bind(null, file)}>
                    <button
                      type="submit"
                      className="ml-2 px-3 py-1 text-sm bg-red-500 text-white rounded-md
                        hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </form>
                </div>

                {type === "image" && (
                  <div className="relative aspect-video">
                    <Image
                      src={`/api/download/${file}`}
                      alt={file}
                      fill
                      className="rounded-md object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                {type === "video" && (
                  <video
                    className="w-full rounded-md"
                    controls
                    src={`/api/download/${file}`}
                  />
                )}
                {type === "audio" && (
                  <audio
                    className="w-full mt-2"
                    controls
                    src={`/api/download/${file}`}
                  />
                )}
                {(type === "document" || type === "other") && (
                  <div className="mt-2">
                    <a
                      href={`/api/download/${file}`}
                      className="text-violet-600 hover:text-violet-700 text-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download File
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {files.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No files uploaded yet</p>
        </div>
      )}
    </>
  );
};

export { List };

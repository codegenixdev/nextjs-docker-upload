import { upload } from "@/app/actions";
import { ALLOWED_TYPES, formatFileSize, MAX_FILE_SIZE } from "@/app/utils";

const Form = () => {
  const handleUpload = async (formData: FormData) => {
    "use server";
    await upload(formData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      <h2 className="text-xl font-semibold mb-4">Upload New File</h2>
      <form action={handleUpload}>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              name="file"
              type="file"
              accept={Object.keys(ALLOWED_TYPES).join(",")}
              className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-violet-50 file:text-violet-700
                  hover:file:bg-violet-100
                  cursor-pointer"
            />
            <p className="mt-2 text-sm text-gray-500">
              Max file size: {formatFileSize(MAX_FILE_SIZE)}
            </p>
            <p className="text-sm text-gray-500">
              Allowed types: {Object.keys(ALLOWED_TYPES).join(", ")}
            </p>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-violet-600 text-white rounded-lg
                hover:bg-violet-700 transition-colors"
          >
            Upload File
          </button>
        </div>
      </form>
    </div>
  );
};

export { Form };

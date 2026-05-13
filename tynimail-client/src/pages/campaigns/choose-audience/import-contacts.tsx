import { Button } from "@/components/ui/button";
import ModelLayout from "@/pages/model/model-layout";
import { Upload } from "lucide-react";
import { FiTrash2, FiUploadCloud } from "react-icons/fi";
import { useDropzone } from "react-dropzone";
import { useState } from "react";

const ImportContacts = ({ onClose }: { onClose: () => void }) => {
  const [file, setFile] = useState<File | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
  });

  const handleRemoveFile = () => {
    setFile(null);
  };

  return (
    <ModelLayout>
      <div className="p-4 w-full max-w-133">
        <div className="bg-background p-6 rounded-2xl border border-input shadow-shadow1 relative">
          <h2 className="text-2xl font-semibold font-inter leading-8">
            Import Contacts
          </h2>
          <p className="text-sm font-normal text-muted-foreground mt-1.5">
            Upload a CSV or Excel file to import contacts.
          </p>

          {/* Upload Area */}
          <div className="my-6" {...getRootProps()}>
            <input {...getInputProps()} />

            <div
              className={`bg-muted-50 text-center p-6 rounded-md border border-dashed cursor-pointer transition ${
                isDragActive ? "border-primary bg-muted" : "border-input"
              }`}
            >
              <Upload className="text-muted-foreground mx-auto" />

              <p className="text-foreground text-sm leading-5 font-medium mt-4">
                <span className="underline underline-offset-2">Browse</span> or
                drop your file here
              </p>
              <p className="text-sm text-muted-foreground pt-1.5">
                CSV, XLS, XLSX — Max 10MB
              </p>
            </div>

            {/* Uploaded File Preview */}
            {file && (
              <div className="mt-4 border border-input flex justify-between items-center rounded-lg p-3 relative">
                <div className="flex items-center gap-3">
                  <img
                    src="/file-xls.png"
                    alt="file"
                    className="w-10 h-10 object-contain"
                  />

                  <div>
                    <h2 className="text-sm font-semibold text-gray-700">
                      {file.name}
                    </h2>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      {(file.size / 1024).toFixed(1)} KB
                      <span className="text-gray-300">|</span>
                      <FiUploadCloud className="text-gray-400 text-xs animate-pulse" />
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-gray-400 hover:text-red-500"
                >
                  <FiTrash2 className="text-lg" />
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid gap-5 grid-cols-2">
            <Button
              variant="outline"
              type="button"
              className="h-10"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="h-10"
              disabled={!file}
            >
              Add Record
            </Button>
          </div>
        </div>
      </div>
    </ModelLayout>
  );
};

export default ImportContacts;

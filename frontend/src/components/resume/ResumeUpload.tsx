import React, { useState, useRef } from 'react';
import { Upload, File, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import axios from "axios";

interface UploadResponse {
  atsScore: number;
  keywords: string[];
  skills: string[];
  matchingJobs: any[];
}

interface ResumeUploadProps {
  onUploadSuccess: (data: UploadResponse) => void;
  initialFile?: File;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({
  onUploadSuccess,
  initialFile,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  React.useEffect(() => {
    if (initialFile) {
      handleFileUpload(initialFile);
    }
  }, [initialFile]);

  const handleFileUpload = async (file: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    // Check for PDF by extension if MIME type doesn't work
    const isPdf = file.name.toLowerCase().endsWith(".pdf");
    const isDoc =
      file.name.toLowerCase().endsWith(".doc") ||
      file.name.toLowerCase().endsWith(".docx");

    if (!allowedTypes.includes(file.type) && !isPdf && !isDoc) {
      setError("Please upload a PDF or Word document");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append("resume", file);

      // Send the file to the backend for parsing
      const response = await api.post<UploadResponse>(
        "/resumes/parse",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response.data);
      formData.append("resumeId", response.data.resumeId);
      const res = await axios.post(
        "http://localhost:8000/upload-resume",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Resume upload !!!:", res.data.data.resume_score);
      const data = {
        ...response.data,
        atsScore: parseInt(res.data.data.resume_score.split("/")[0]),
      };
      console.log("Resume upload response:", data);
      onUploadSuccess(data);
    } catch (err: any) {
      console.error("Resume upload error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to parse resume. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    const input = fileInputRef.current;
    if (input) {
      input.value = "";
      input.click();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />

      {/* Clear instructions */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium mb-2">Upload Your Resume</h3>
        <p className="text-gray-600">Select a PDF or Word document to upload</p>
      </div>

      {/* Big, prominent upload button */}
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full mb-6 flex items-center justify-center px-6 py-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <span className="flex items-center">
            <File className="w-6 h-6 mr-2 animate-pulse" />
            Analyzing Resume...
          </span>
        ) : (
          <span className="flex items-center">
            <Upload className="w-6 h-6 mr-2" />
            Select Resume File
          </span>
        )}
      </button>

      {/* Drop zone area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFileUpload(file);
        }}
        className={`w-full border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
        }`}
      >
        <p className="text-gray-600">Or drop your file here</p>
      </div>

      {error && (
        <div className="mt-4 w-full p-3 bg-red-50 text-red-700 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}
    </div>
  );
};

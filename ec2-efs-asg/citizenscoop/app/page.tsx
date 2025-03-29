"use client";

import { useState, useEffect } from "react";
import { Upload, FileText } from "lucide-react";
import axios from "axios";

export default function Home() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<{ message: string; type: "success" | "error" | "" }>({ message: "", type: "" });

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const fetchUploadedFiles = async () => {
    try {
      const response = await axios.get("http://54.236.21.189:4000/files");
      setUploadedFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const selectedFile = event.target.files[0];

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axios.post("http://54.236.21.189:4000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadStatus({ message: "File uploaded successfully!", type: "success" });
      fetchUploadedFiles();
    } catch (error) {
      setUploadStatus({ message: "File upload failed. Please try again.", type: "error" });
      console.error("File upload failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-purple-700 text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">CitizenScoop</h1>
        <div className="space-x-6">
          <a href="#" className="hover:text-gray-300">Home</a>
          <a href="#" className="hover:text-gray-300">Articles</a>
          <a href="#" className="hover:text-gray-300">Upload</a>
          <a href="#" className="hover:text-gray-300">Contact</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-16 px-4">
        <h2 className="text-4xl font-bold">Where Citizens Break the News</h2>
        <p className="mt-2 text-lg">Your voice. Your stories. Your platform.</p>
      </header>

      {/* Latest Articles */}
      <section className="max-w-4xl mx-auto mt-10">
        <h2 className="text-3xl font-semibold text-center text-gray-800">Latest News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Example Articles */}
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <img src="/news1.jpg" alt="News" className="rounded-lg w-full" />
            <h3 className="text-xl font-bold mt-2">Breaking: Major Policy Change</h3>
            <p className="text-gray-600 mt-1">Government announces new policies...</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-lg">
            <img src="/news2.jpg" alt="News" className="rounded-lg w-full" />
            <h3 className="text-xl font-bold mt-2">Exclusive: Investigation Report</h3>
            <p className="text-gray-600 mt-1">A deep dive into financial scandals...</p>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="max-w-3xl mx-auto bg-white text-gray-800 rounded-2xl shadow-xl p-8 mt-12">
        <h2 className="text-2xl font-bold text-center text-purple-700">Upload Your News</h2>
        <p className="text-center text-gray-600">Contribute to CitizenScoop by uploading your own reports.</p>

        <div className="mt-6 border-2 border-dashed border-gray-300 p-6 rounded-lg text-center cursor-pointer hover:bg-gray-100">
          <label className="cursor-pointer">
            <Upload className="mx-auto text-purple-700" size={40} />
            <p className="mt-2 text-gray-600">Click to upload a news article</p>
            <input type="file" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        {/* Upload Status Message */}
        {uploadStatus.message && (
          <div className={`mt-4 text-center p-2 rounded-lg ${uploadStatus.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {uploadStatus.message}
          </div>
        )}

        {/* Display Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800">Uploaded Articles</h2>
            <ul className="mt-2 space-y-2">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="flex items-center gap-2 p-2 bg-gray-200 rounded-lg">
                  <FileText className="text-blue-600" size={20} />
                  <a href={`http://54.236.21.189:4000/files/${file}`} className="text-gray-800 hover:underline">
                    {file}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-600 py-6 mt-12 border-t">
        &copy; 2025 CitizenScoop. All rights reserved.
      </footer>
    </div>
  );
}

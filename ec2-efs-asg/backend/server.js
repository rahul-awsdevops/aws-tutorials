const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;
const UPLOAD_DIR = "/mnt/efs/uploads"; // Mount EFS here

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use(cors({
    origin: "*", // Update this if needed
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
}));
app.use(express.json());
app.use("/files", express.static(UPLOAD_DIR)); // Serve static files

// Multer setup for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const upload = multer({ storage });

// API: Upload file
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        console.error("Upload failed: No file provided.");
        return res.status(400).json({ error: "No file uploaded" });
    }
    console.log("File uploaded:", req.file.filename);
    res.json({ message: "File uploaded successfully", filename: req.file.filename });
});

// API: Get uploaded files
app.get("/files", (req, res) => {
    fs.readdir(UPLOAD_DIR, (err, files) => {
        if (err) {
            console.error("Error reading upload directory:", err);
            return res.status(500).json({ error: "Failed to list files" });
        }
        console.log("Fetched files:", files);
        res.json(files);
    });
});

// API: Serve files
app.get("/files/:filename", (req, res) => {
    const filePath = path.join(UPLOAD_DIR, req.params.filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
    }
    res.sendFile(filePath);
});

// Start server
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));

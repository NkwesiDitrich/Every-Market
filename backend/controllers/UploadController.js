exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        // multer-storage-cloudinary automatically uploads to cloudinary and provides the url in req.file.path
        res.status(200).json({ url: req.file.path });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Error uploading image" });
    }
};

exports.uploadMultipleImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }
        const urls = req.files.map((file) => file.path);
        res.status(200).json({ urls });
    } catch (error) {
        console.error("Multiple upload error:", error);
        res.status(500).json({ message: "Error uploading multiple images" });
    }
};

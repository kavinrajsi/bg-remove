const express = require("express");
const multer = require("multer");
// const fileUpload = require("express-fileupload");
// const path = require("path");
const fs = require("fs");
const { removeBackground } = require("@imgly/background-removal-node");
const upload = multer({ dest: "uploads" });

const app = express();
const port = 3000;

// Serve HTML and JS from the public directory
app.use(express.static("public"));

// Function to remove background from an image
async function removeImageBackground(imgSource) {
  try {
    // Removing background
    const blob = await removeBackground(imgSource);

    // Converting Blob to buffer
    const buffer = Buffer.from(await blob.arrayBuffer());

    // Generating data URL
    const dataURL = `data:image/png;base64,${buffer.toString("base64")}`;

    // Returning the data URL
    return dataURL;
  } catch (error) {
    // Handling errors
    throw new Error("Error removing background: " + error);
  }
}

// Route to handle uploads
app.post("/remove-background", upload.single("image"), async (req, res) => {
  try {
    // Call your background removal function
    const dataURL = await removeImageBackground(req.file.path);

    // Extract base64 part and save to file
    const base64Data = dataURL.split(";base64,").pop();
    fs.writeFileSync(`processed/${req.file.filename}.png`, base64Data, {
      encoding: "base64",
    });

    // Serve the processed image
    res.sendFile(`${__dirname}/processed/${req.file.filename}.png`);
  } catch (error) {
    console.error("Error removing background:", error);
    res.status(500).send("Failed to process image");
  }
});

// Listen on port 3000
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

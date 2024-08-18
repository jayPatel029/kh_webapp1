const fs = require("fs");
const path = require("path");

// Set up AWS credentials
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// AWS S3 Code for multiple file upload
// exports.uploadFiles = async (req, res) => {
//   let ObjectUrls = [];
//   try {
//     for (const file of req.files) {
//       const fileStream = fs.createReadStream(file.path);
//       const params = {
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: parseInt(Math.random() * 10000) + "_" + file.originalname,
//         Body: fileStream,
//       };

// Ensure the directory exists
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

exports.uploadFiles = async (req, res) => {
  let ObjectUrls = [];
  try {
    for (const file of req.files) {
      const uniqueFilename = parseInt(Math.random() * 10000) + "_" + file.originalname;
      const savePath = path.join(uploadDirectory, uniqueFilename);

      // Move the file to the desired directory
      fs.renameSync(file.path, savePath);

      const objectUrl = `/uploads/${uniqueFilename}`; // Adjust this path based on your server setup
      ObjectUrls.push(objectUrl);
    }
    res.status(200).send({ message: "Files uploaded", ObjectUrls });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to upload files: " + err.message);
  }
};

exports.uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  try {
    const uniqueFilename = parseInt(Math.random() * 10000) + "_" + req.file.originalname;
    const savePath = path.join(uploadDirectory, uniqueFilename);

    // Move the file to the desired directory
    fs.renameSync(req.file.path, savePath);

    const objectUrl = `/uploads/${uniqueFilename}`; // Adjust this path based on your server setup
    res.status(200).send({ message: 'File uploaded', objectUrl });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to upload file: ' + err.message);
  }
};

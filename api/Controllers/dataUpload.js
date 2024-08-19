const fs = require("fs");
const dotenv = require("dotenv");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

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

//       await s3Client.send(new PutObjectCommand(params));
//       const objectUrl = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
//       ObjectUrls.push(objectUrl);
//       fs.unlinkSync(file.path);
//     }
//     res.status(200).send({ message: "File uploaded", ObjectUrls });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Failed to upload file" + err.message);
//   }
// };

//Local Multiple Files Upload Code
exports.uploadFiles = async (req, res) => {
  let filePaths = [];
  const uploadDir = path.join(__dirname, "uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  try {
    for (const file of req.files) {
      const targetPath = path.join(uploadDir, file.originalname);

      fs.renameSync(file.path, targetPath);
      filePaths.push(targetPath);
    }
    res.status(200).send({ message: "Files uploaded", objectUrl});
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to upload files: " + err.message);
    res.status(500).send("Failed to upload files: " + err.message);
  }
};

//AWS S3 Code
// exports.uploadFile = async (req, res) => {
//   if (!req.file) {
//     return res.status(400).send("No file uploaded");
//   }
//   const fileStream = fs.createReadStream(req.file.path);

//   const params = {
//     Bucket: process.env.AWS_BUCKET_NAME,
//     Key: parseInt(Math.random() * 10000) + "_" + req.file.originalname,
//     Body: fileStream,
//   };

//   try {
//     await s3Client.send(new PutObjectCommand(params));
//     const objectUrl = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
//     fs.unlinkSync(req.file.path);
//     res.status(200).send({ message: "File uploaded", objectUrl });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Failed to upload file" + err.message);
//   }
// };

//Local File Upload Code

exports.uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  const uploadDir = path.join(__dirname, "uploads");
  // console.log("uploadDir", uploadDir);
  const targetPath = path.join(uploadDir, req.file.originalname);
  console.log("targetPath", targetPath);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  try {
    fs.renameSync(req.file.path, targetPath);
    res.status(200).send({ message: "File uploaded", objectUrl: targetPath });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to upload file: " + err.message);
  }
};
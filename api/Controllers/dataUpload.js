const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");

// Set up AWS credentials
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

exports.uploadFiles = async (req, res) => {
    let ObjectUrls = [];
  try {
    for (const file of req.files) {
      const fileStream = fs.createReadStream(file.path);
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: parseInt(Math.random() *10000) +"_" + file.originalname  ,
        Body: fileStream,
      };

      await s3Client.send(new PutObjectCommand(params));
      const objectUrl = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
      fs.unlinkSync(file.path);
    }
    res.status(200).send({ message: "File uploaded", ObjectUrls });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to upload file" + err.message);
  }
};

exports.uploadFile = async (req, res) => {
  if (!req.file) {
      return res.status(400).send('No file uploaded');
  }
  const fileStream = fs.createReadStream(req.file.path);


  const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: parseInt(Math.random() *10000) + "_" + req.file.originalname,
      Body: fileStream,
  };

  try {
      await s3Client.send(new PutObjectCommand(params));
      const objectUrl = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
      fs.unlinkSync(req.file.path);
      res.status(200).send({ message: 'File uploaded', objectUrl });
  } catch (err) {
      console.error(err);
      res.status(500).send('Failed to upload file' + err.message);
  }
};
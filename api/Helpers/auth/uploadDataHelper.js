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

exports.uploadFile = async (filename, filepath) => {
  if (!fs.existsSync(filepath)) {
    throw "filepath galat";
    // return "";
  }
  const fileStream = fs.createReadStream(filepath);

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: parseInt(Math.random() * 10000) + "_" + filename,
    Body: fileStream,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    const objectUrl = `https://${params.Bucket}.s3.amazonaws.com/${params.Key}`;
    // fs.unlinkSync(req.file.path);
    return objectUrl;
  } catch (err) {
    console.error(err);
    throw err;
    // return "";
  }
};

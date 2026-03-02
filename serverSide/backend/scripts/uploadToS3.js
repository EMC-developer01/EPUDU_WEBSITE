import AWS from "aws-sdk";
import multer from "multer";
import mime from "mime-types";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const upload = multer({
  storage: multer.memoryStorage(),
});

export const uploadImage = async (req, res) => {
  try {
    const file = req.file;

    const key = `uploads/${Date.now()}-${file.originalname}`;

    const result = await s3
      .upload({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read",
      })
      .promise();

    res.json({
      success: true,
      url: result.Location,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};
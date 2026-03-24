import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const getUploadUrls = async (req, res) => {
  try {
    const { fileName, fileType } = req.body;

    const key = `uploads/${Date.now()}-${fileName}`;

    const uploadUrl = s3.getSignedUrl("putObject", {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Expires: 60,
      ContentType: fileType,
      ACL: "public-read",
    });

    res.json({
      uploadUrl,
      key, // ✅ IMPORTANT: send key only
    });
  } catch (err) {
    res.status(500).json({ message: "Error generating upload URL" });
  }
};
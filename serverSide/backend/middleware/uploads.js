import multer from "multer";
import multerS3 from "multer-s3";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      // frontend sends folder name
      // example: banners, homepageVideos, vendorItems
      const folder = req.body.folder || "others";

      cb(null, `uploads/${folder}/${Date.now()}-${file.originalname}`);
    },
  }),
});

export default upload;

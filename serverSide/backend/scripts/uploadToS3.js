import "dotenv/config";
import fs from "fs";
import path from "path";
import AWS from "aws-sdk";
import { fileURLToPath } from "url";
import mime from "mime-types";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// S3 config
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET = process.env.AWS_BUCKET_NAME;
console.log(process.env.AWS_BUCKET_NAME)
const LOCAL_ROOT = path.join(__dirname, "../uploads");

// 🔁 walk folders recursively
const walkAndUpload = async (dir) => {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await walkAndUpload(fullPath);
    } else {
      // preserve relative path
      const relativePath = path
        .relative(LOCAL_ROOT, fullPath)
        .replace(/\\/g, "/");

      const s3Key = `uploads/${relativePath}`;

      const fileContent = fs.readFileSync(fullPath);

      // ✅ FIXED: define contentType here
      const contentType =
        mime.lookup(fullPath) || "application/octet-stream";

      await s3
        .upload({
          Bucket: BUCKET,
          Key: s3Key,
          Body: fileContent,
          ContentType: contentType,
          // ACL: "public-read",
        })
        .promise();

      console.log("Uploaded:", s3Key);
    }
  }
};


walkAndUpload(LOCAL_ROOT)
  .then(() => console.log("✅ Folder structure preserved & uploaded to S3"))
  .catch(console.error);

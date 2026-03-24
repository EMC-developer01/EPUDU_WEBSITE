import AWS from "aws-sdk";

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export const getUploadUrl = async (req, res) => {
    try {
        const { fileName, fileType } = req.body;

        // ✅ clean filename (avoid spaces issue)
        const cleanFileName = fileName.replace(/\s+/g, "-");

        // ✅ correct folder structure
        const key = `uploads/invitationCards/${Date.now()}-${cleanFileName}`;

        const uploadUrl = s3.getSignedUrl("putObject", {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Expires: 60,
            ContentType: fileType,
            ACL: "public-read",
        });

        res.status(200).json({
            success: true,
            uploadUrl,
            key,
        });

    } catch (error) {
        console.error("S3 Upload URL Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate upload URL",
        });
    }
};
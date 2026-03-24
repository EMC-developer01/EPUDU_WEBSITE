import AWS from "aws-sdk";

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export const getUploadUrl = async (req, res) => {
    try {
        const { fileName, fileType } = req.body;
        const { type } = req.params;

        const allowedTypes = [
            "banners",
            "homepageImages",
            "homepageServices",
            "homepageVideos",
            "invitationCards",
            "vendorItems",
            "vendorAgreements"
        ];

        if (!allowedTypes.includes(type)) {
            return res.status(400).json({ message: "Invalid upload type" });
        }

        const cleanFileName = fileName.replace(/\s/g, "_");

        const key = `${type}/${Date.now()}-${cleanFileName}`;

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            ContentType: fileType,
        };

        const uploadUrl = await s3.getSignedUrlPromise("putObject", params);

        res.json({
            uploadUrl,
            key,
            fileUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
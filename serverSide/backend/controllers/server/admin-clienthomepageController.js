import AWS from "aws-sdk";
import ClientHomepageVideo from "../../models/server/admin-clientHomepageVideo.js";


const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});


/* ADD */
export const addVideo = async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "Video file is required" });
        }

        const key = `uploads/homepageVideos/${Date.now()}-${file.originalname}`;

        const uploadResult = await s3
            .upload({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: "public-read",
            })
            .promise();

        const video = await ClientHomepageVideo.create({
            title: req.body.title,
            video: key, // save S3 key
            isActive: req.body.isActive === "true",
        });

        res.status(201).json(video);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

/* GET ALL */
export const getAllVideos = async (req, res) => {
    try {
        const videos = await ClientHomepageVideo.find().sort({ createdAt: -1 });
        res.json(videos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* UPDATE */
export const updateVideo = async (req, res) => {
    try {
        const data = {
            title: req.body.title,
            isActive: req.body.isActive === "true",
        };

        if (req.file) {
            const file = req.file;

            const key = `uploads/homepageVideos/${Date.now()}-${file.originalname}`;

            await s3
                .upload({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                    ACL: "public-read",
                })
                .promise();

            data.video = key;
        }

        const video = await ClientHomepageVideo.findByIdAndUpdate(
            req.params.id,
            data,
            { new: true }
        );

        res.json(video);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* STATUS */
export const updateStatus = async (req, res) => {
    try {
        const video = await ClientHomepageVideo.findByIdAndUpdate(
            req.params.id,
            { isActive: req.body.isActive },
            { new: true }
        );
        res.json(video);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

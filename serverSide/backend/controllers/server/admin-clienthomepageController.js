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
        const { title, video, isActive } = req.body;

        if (!video) {
            return res.status(400).json({ message: "Video key is required" });
        }

        const newVideo = await ClientHomepageVideo.create({
            title,
            video, // ✅ already S3 key
            isActive,
        });

        res.status(201).json(newVideo);
    } catch (err) {
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
        const { title, video, isActive } = req.body;

        const updated = await ClientHomepageVideo.findByIdAndUpdate(
            req.params.id,
            {
                title,
                isActive,
                ...(video && { video }), // only update if new video
            },
            { new: true }
        );

        res.json(updated);
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

import ClientHomepageVideo from "../../models/server/admin-clientHomepageVideo.js";

/* ADD */
export const addVideo = async (req, res) => {
    try {
        const video = await ClientHomepageVideo.create({
            title: req.body.title,
            video: req.file.filename,
            isActive: req.body.isActive,
        });
        res.status(201).json(video);
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
        const data = {
            title: req.body.title,
            isActive: req.body.isActive,
        };

        if (req.file) {
            data.video = req.file.filename;
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

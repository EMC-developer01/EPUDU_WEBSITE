import ClientHomepageImage from "../../models/server/admin-clientHomepageImagesModel.js";

export const createImage = async (req, res) => {
    const image = await ClientHomepageImage.create({
        ...req.body, // includes image (S3 URL)
    });
    res.json(image);
};

export const updateImage = async (req, res) => {
    await ClientHomepageImage.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
};

export const getImages = async (req, res) => {
    const images = await ClientHomepageImage.find().sort({ createdAt: -1 });
    res.json(images);
};


export const toggleStatus = async (req, res) => {
    await ClientHomepageImage.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
};

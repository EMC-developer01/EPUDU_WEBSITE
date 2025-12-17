import ClientHomepageImage from "../../models/server/admin-clientHomepageImagesModel.js";

export const createImage = async (req, res) => {
    const image = await ClientHomepageImage.create({
        image: req.file.filename,
        ...req.body,
    });
    res.json(image);
};

export const getImages = async (req, res) => {
    const images = await ClientHomepageImage.find().sort({ createdAt: -1 });
    res.json(images);
};

export const updateImage = async (req, res) => {
    const data = req.file
        ? { ...req.body, image: req.file.filename }
        : req.body;

    await ClientHomepageImage.findByIdAndUpdate(req.params.id, data);
    res.json({ success: true });
};

export const toggleStatus = async (req, res) => {
    await ClientHomepageImage.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
};

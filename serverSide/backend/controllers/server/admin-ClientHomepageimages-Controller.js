import ClientHomepageImage from "../../models/server/admin-clientHomepageImagesModel.js";

const fixS3Url = (url) => {
    if (!url) return "";

    if (url.includes(`s3.${process.env.AWS_REGION}.amazonaws.com`)) {
        return url;
    }

    return url.replace(
        "s3.amazonaws.com",
        `s3.${process.env.AWS_REGION}.amazonaws.com`
    );
};

export const createImage = async (req, res) => {
    const data = {
        ...req.body,
        image: fixS3Url(req.body.image),
    };

    const image = await ClientHomepageImage.create(data);
    res.json(image);
};

export const updateImage = async (req, res) => {
    const data = {
        ...req.body,
        image: fixS3Url(req.body.image),
    };

    await ClientHomepageImage.findByIdAndUpdate(req.params.id, data);
    res.json({ success: true });
};

export const getImages = async (req, res) => {
    const images = await ClientHomepageImage.find().sort({ createdAt: -1 });

    const updatedImages = images.map((img) => ({
        ...img._doc,
        image: fixS3Url(img.image),
    }));

    res.json(updatedImages);
};

export const toggleStatus = async (req, res) => {
    await ClientHomepageImage.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
};


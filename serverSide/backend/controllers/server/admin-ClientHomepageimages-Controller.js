import ClientHomepageImage from "../../models/server/admin-clientHomepageImagesModel.js";

export const createImage = async (req, res) => {
    const image = await ClientHomepageImage.create({
        ...req.body, // includes image (S3 URL)
    });
    res.json(image);
};

const fixS3Url = (url) => {
    if (!url) return "";

    // already correct
    if (url.includes(`s3.${process.env.AWS_REGION}.amazonaws.com`)) {
        return url;
    }

    // fix old wrong URLs
    return url.replace(
        "s3.amazonaws.com",
        `s3.${process.env.AWS_REGION}.amazonaws.com`
    );
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


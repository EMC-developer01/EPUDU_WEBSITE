import ClientBanner from "../../models/server/admin-clientbannerModel.js";

export const addBanner = async (req, res) => {
    const banner = await ClientBanner.create({
        ...req.body,
        image: req.file.filename,
    });
    res.json(banner);
};

export const getAllBanners = async (req, res) => {
    const banners = await ClientBanner.find().sort({ createdAt: -1 });
    res.json(banners);
};

export const updateBanner = async (req, res) => {
    const update = { ...req.body };

    if (req.file) update.image = req.file.filename;

    const banner = await ClientBanner.findByIdAndUpdate(
        req.params.id,
        update,
        { new: true }
    );

    res.json(banner);
};

export const toggleBannerStatus = async (req, res) => {
    const banner = await ClientBanner.findByIdAndUpdate(
        req.params.id,
        { isActive: req.body.isActive },
        { new: true }
    );
    res.json(banner);
};

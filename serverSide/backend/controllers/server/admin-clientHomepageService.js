import ClientHomepageService from "../../models/server/admin-ClientHomepageservice.js";

/* ADD */
export const addService = async (req, res) => {
  try {
    const service = await ClientHomepageService.create({
      ...req.body, // image already S3 URL
    });

    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* GET ALL */
export const getAllServices = async (_, res) => {
  const services = await ClientHomepageService.find().sort({ createdAt: -1 });
  res.json(services);
};

/* UPDATE */
export const updateService = async (req, res) => {
  try {
    const data = { ...req.body };

    // ❗ prevent image overwrite if not sent
    if (!data.image) {
      delete data.image;
    }

    const service = await ClientHomepageService.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );

    res.json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* STATUS TOGGLE */
export const updateStatus = async (req, res) => {
  const service = await ClientHomepageService.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true }
  );
  res.json(service);
};

import ClientInvitationCard from "../../models/server/admin-clientInvitaionCardModels.js";
import fs from "fs";
import path from "path";

/* ---------------- ADD CARD ---------------- */
import ClientInvitationCard from "../../models/server/admin-clientInvitaionCardModels.js";
import fs from "fs";
import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../config/s3.js";

/* ---------------- ADD CARD ---------------- */
export const addCard = async (req, res) => {
  try {
    const { cardName, eventName, description, isActive } = req.body;

    if (!req.file)
      return res.status(400).json({ message: "Image is required" });

    const localPath = req.file.path.replace(/\\/g, "/");
    const fileName = req.file.filename;

    // ✅ This is the key that goes to S3 and DB
    const s3Key = `invitationCards/${fileName}`;

    const fileContent = fs.readFileSync(localPath);

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        Body: fileContent,
        ContentType: req.file.mimetype,
      })
    );

    // 🔥 Remove local file after upload (optional but recommended)
    fs.unlinkSync(localPath);

    const card = await ClientInvitationCard.create({
      image: s3Key, // ✅ only this goes to DB
      cardName,
      eventName,
      description,
      isActive: isActive === "true" || isActive === true,
    });

    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- GET ALL CARDS ---------------- */
export const getAllCards = async (req, res) => {
  try {
    const cards = await ClientInvitationCard.find().sort({ createdAt: -1 });
    res.status(200).json(cards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- UPDATE CARD ---------------- */
export const updateCard = async (req, res) => {
  try {
    const card = await ClientInvitationCard.findById(req.params.id);
    if (!card) return res.status(404).json({ message: "Card not found" });

    const { cardName, eventName, description, isActive } = req.body;

    if (req.file) {
      const localPath = req.file.path.replace(/\\/g, "/");
      const fileName = req.file.filename;
      const s3Key = `invitationCards/${fileName}`;

      const fileContent = fs.readFileSync(localPath);

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: s3Key,
          Body: fileContent,
          ContentType: req.file.mimetype,
        })
      );

      fs.unlinkSync(localPath);

      card.image = s3Key; // ✅ only this
    }

    card.cardName = cardName;
    card.eventName = eventName;
    card.description = description;
    card.isActive = isActive === "true" || isActive === true;

    await card.save();
    res.status(200).json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- TOGGLE STATUS ---------------- */
export const toggleCardStatus = async (req, res) => {
  try {
    const card = await ClientInvitationCard.findById(req.params.id);
    if (!card) return res.status(404).json({ message: "Card not found" });

    card.isActive = !card.isActive;
    await card.save();

    res.status(200).json(card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

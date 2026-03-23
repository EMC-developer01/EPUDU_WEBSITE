import ClientInvitationCard from "../../models/server/admin-clientInvitaionCardModels.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../../config/s3.js";
import { v4 as uuidv4 } from "uuid";

/* ---------------- HELPER: Upload buffer to S3 ---------------- */
const uploadToS3 = async (file) => {
  const ext = file.originalname.split(".").pop();
  const fileName = `${Date.now()}-${uuidv4()}.${ext}`;
  const s3Key = `invitationCards/${fileName}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      Body: file.buffer,          // ✅ memoryStorage gives buffer, not path
      ContentType: file.mimetype,
    })
  );

  return s3Key;
};

/* ---------------- ADD CARD ---------------- */
export const addCard = async (req, res) => {
  try {
    const { cardName, eventName, description, isActive } = req.body;

    if (!req.file)
      return res.status(400).json({ message: "Image is required" });

    const s3Key = await uploadToS3(req.file);  // ✅ direct buffer upload

    const card = await ClientInvitationCard.create({
      image: s3Key,
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
      const s3Key = await uploadToS3(req.file);  // ✅ direct buffer upload
      card.image = s3Key;
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
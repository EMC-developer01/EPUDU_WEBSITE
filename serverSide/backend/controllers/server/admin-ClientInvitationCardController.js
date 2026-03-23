import ClientInvitationCard from "../../models/server/admin-clientInvitaionCardModels.js";

/* ---------------- ADD ---------------- */
export const addCard = async (req, res) => {
  try {
    const { cardName, eventName, description, isActive, image } = req.body;

    if (!image)
      return res.status(400).json({ message: "Image is required" });

    const card = await ClientInvitationCard.create({
      image,
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

/* ---------------- GET ---------------- */
export const getAllCards = async (req, res) => {
  try {
    const cards = await ClientInvitationCard.find().sort({ createdAt: -1 });
    res.status(200).json(cards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- UPDATE ---------------- */
export const updateCard = async (req, res) => {
  try {
    const card = await ClientInvitationCard.findById(req.params.id);
    if (!card) return res.status(404).json({ message: "Card not found" });

    const { cardName, eventName, description, isActive, image } = req.body;

    if (image) card.image = image;

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

/* ---------------- TOGGLE ---------------- */
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
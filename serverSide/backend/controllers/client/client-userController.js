import User from "../../models/client/client-userModel.js";

export const getUserByMobile = async (req, res) => {
  try {
    const { mobile } = req.params;
    const user = await User.findOne({ mobile });
    if (!user) {
      user = new User({ mobile }); // name = 'Guest' by default
      await user.save();
    }
    res.json(user);
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const addUser = async (req, res) => {
  try {
    const { name, mobile } = req.body;
    console.log("📩 Incoming data:", mobile);

    if (!mobile) return res.status(400).json({ message: "Mobile is required" });

    let user = await User.findOne({ mobile });
    if (user) return res.status(200).json({ user, message: "User already exists" });

    user = new User({
      name: name || "Guest",
      mobile,
    });
    await user.save();

    res.status(201).json({ user, message: "User created successfully" });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Server error while creating user" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error fetching users" });
  }
};

// ✅ Update user
// controllers/client/client-userController.js

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedData = {
      ...req.body
    };

    if (req.file) {
      updatedData.photo = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error while deleting user" });
  }
};



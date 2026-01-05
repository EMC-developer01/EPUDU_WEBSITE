import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./common/Header";
import Footer from "./common/Footer";
import axios from "axios";

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    mail: "",
    mobile: "",
    photo: ""
  });

  // 🔹 Fetch user by mobile
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    const { mobile } = JSON.parse(storedUser);

    axios
      .get(`http://localhost:4000/api/client/users/${mobile}`)
      .then((res) => {
        setUser(res.data);
        setFormData(res.data);
      })
      .catch((err) => console.error(err));
  }, [navigate]);

  // 🔹 Image → Base64
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, photo: reader.result });
    };
    reader.readAsDataURL(file);
  };

  // 🔹 Save Profile
  const handleSave = async () => {
    try {
      await axios.put(
        `http://localhost:4000/api/client/users/${user._id}`,
        formData
      );

      setEditMode(false);
      setUser(formData);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  // 🔹 Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  return (
    <>
      <Header />

      <section className="min-h-screen w-full bg-gray-100 flex justify-center items-center px-4 py-12">
        <div className="w-full max-w-xl lg:max-w-5xl bg-white shadow-lg rounded-2xl p-8">

          <h2 className="text-3xl font-bold text-center mb-8">
            Profile Details
          </h2>

          {/* PROFILE PHOTO */}
          <div className="flex flex-col items-center mb-8">
            <img
              src={
                formData.photo ||
                "https://via.placeholder.com/120"
              }
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border"
            />

            {editMode && (
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="mt-3 text-sm"
              />
            )}
          </div>

          {/* DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">

            {/* NAME */}
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              {editMode ? (
                <input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="border rounded p-2 w-full"
                />
              ) : (
                <p className="text-lg font-medium">{user.name}</p>
              )}
            </div>

            {/* MOBILE */}
            <div>
              <p className="text-sm text-gray-500">Mobile</p>
              <p className="text-lg font-medium">{user.mobile}</p>
            </div>

            {/* EMAIL */}
            <div>
              <p className="text-sm text-gray-500">Email</p>
              {editMode ? (
                <input
                  value={formData.mail || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, mail: e.target.value })
                  }
                  className="border rounded p-2 w-full"
                />
              ) : (
                <p className="text-lg font-medium">
                  {user.mail || "Not Available"}
                </p>
              )}
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col gap-3">

            {editMode ? (
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-green-500 text-white py-3 rounded-lg"
                >
                  Save
                </button>

                <button
                  onClick={() => {
                    setEditMode(false);
                    setFormData(user);
                  }}
                  className="flex-1 bg-gray-400 text-white py-3 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="w-full bg-blue-500 text-white py-3 rounded-lg"
              >
                Edit Profile
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-3 rounded-lg"
            >
              Logout
            </button>

          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Profile;

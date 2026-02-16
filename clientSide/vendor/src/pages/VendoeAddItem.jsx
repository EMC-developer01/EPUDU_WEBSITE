import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";

export default function VendorAddItem() {
    const [formData, setFormData] = useState({
        vendorId: "",
        name: "",
        price: "",
        discount: "",
        description: "",
        category: "",
        subcategory: "",
        foodType: "",    // NEW
        mealTime: "",    // NEW
        cuisine: "",
        foodModel: "",
        gamesAges: "",
        PhotographyPackage: "",
        image: null,
    });

    const [preview, setPreview] = useState(null);
    const [items, setItems] = useState([]);
    const [vendorId, setVendorId] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [filters, setFilters] = useState({
        category: "",
        subcategory: "",
        mealTime: "",
        foodType: "",
        cuisine: "",
    });


    const subcategoriesMap = {
        Decoration: ["Stage", "Entrance", "Photo Booth", "Table Decor", "Cake Setup", "Lighting", "seating",],
        Catering: ["Welcome Drinks", "Starters", "Main Course", "Desserts", "Snacks", "Beverages", "Fruits"],
        Photography: ["Photo/Videography Team", "Instant Photo",],
        Makeup: ["Bride", "Groom", "Bridesmaids", "Family"],
        Venue: ["Indoor", "Outdoor", "Banquet Hall", "Open Garden"],
        Entertainment: ["Games / Fun Activities", "Music / DJ / Sound System", "Dance", "Magic Show", "Puppet Show", "Cartoon Character", "Live Performance"],
    };
    const API_URL = import.meta.env.VITE_API_URL;
    const MEDIA_URL = import.meta.env.VITE_MEDIA_URL;

    const API = `${API_URL}/api/vendor`;



    useEffect(() => {
        const vendor = JSON.parse(localStorage.getItem("vendor"));
        // console.log(vendor);
        if (vendor) {
            setFormData((prev) => ({ ...prev, vendorId: vendor._id }));
            setVendorId(vendor._id);
        }
    }, []);

    const fetchItems = async () => {
        console.log(vendorId)
        try {
            const res = await axios.get(`${API}/items/getitems?vendorId=${vendorId}`);
            setItems(res.data.items);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (vendorId) {
            fetchItems();
        }
    }, [vendorId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "category") {
            // Reset subcategory, foodType, mealTime when category changes
            setFormData({ ...formData, category: value, subcategory: "", foodType: "", mealTime: "", cuisine: "", PhotographyPackage: "", foodModel: "", gamesAges: "", });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, image: file });
        if (file) setPreview(URL.createObjectURL(file));
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData((prev) => ({
            ...prev,
            name: "",
            price: "",
            discount: "",
            description: "",
            category: "",
            subcategory: "",
            foodType: "",
            mealTime: "",
            cuisine: "",
            foodModel: "",
            gamesAges: "",
            PhotographyPackage: "",
            image: null,
        }));
        setPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const fd = new FormData();
        Object.keys(formData).forEach((key) => fd.append(key, formData[key]));
        try {
            await axios.post(`${API}/items/additem`, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Item Added Successfully!");
            resetForm();
            // fetchItems();
        } catch (err) {
            alert("Failed to add item");
        }
        try {
            fetchItems();
        } catch (err) {
            console.log("Fetch failed after add", err);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this item?")) return;
        try {
            await axios.delete(`${API}/items/delete/${id}`);
            fetchItems();
        } catch (err) {
            console.log(err);
        }
    };

    const deleteSelected = async () => {
        if (selectedItems.length === 0) return alert("Select at least one item");
        if (!confirm("Delete selected items?")) return;
        try {
            for (const id of selectedItems) {
                await axios.delete(`${API}/items/delete/${id}`);
            }
            setSelectedItems([]);
            fetchItems();
        } catch (err) {
            console.log(err);
        }
    };

    const startEditing = (item) => {
        setEditingId(item._id);
        setFormData({
            vendorId: item.vendorId || "",
            name: item.name,
            price: item.price,
            discount: item.discount,
            description: item.description,
            category: item.category,
            subcategory: item.subcategory || "",
            foodType: item.foodType || "",
            mealTime: item.mealTime || "",
            cuisine: item.cuisine || "",
            foodModel: item.foodModel || "",
            gamesAges: item.gamesAges || "",
            PhotographyPackage: item.PhotographyPackage || "",
            image: null,
        });
        setPreview(`${MEDIA_URL}/vendorItems/${item.image}`);
    };

    const handleUpdate = async () => {
        const fd = new FormData();
        Object.keys(formData).forEach((key) => {
            if (formData[key] !== null) fd.append(key, formData[key]);
        });
        try {
            await axios.put(`${API}/items/update/${editingId}`, fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Item Updated Successfully!");
            resetForm();
            fetchItems();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <>
            <Header />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 mt-6">
                {/* LEFT SIDE FORM */}
                <div className="bg-white p-6 shadow-md rounded-xl">
                    <h2 className="text-xl font-bold mb-4">
                        {editingId ? "Edit Item" : "Add Item"}
                    </h2>

                    <form className="space-y-4">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Item Name"
                            className="w-full p-3 border rounded"
                            required
                        />
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="Price"
                            className="w-full p-3 border rounded"
                            required
                        />
                        <input
                            type="number"
                            name="discount"
                            value={formData.discount}
                            onChange={handleChange}
                            placeholder="Discount (%)"
                            className="w-full p-3 border rounded"
                        />

                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full p-3 border rounded"
                            required
                        >
                            <option value="">Select Category</option>
                            {Object.keys(subcategoriesMap).map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>

                        {formData.category && (
                            <select
                                name="subcategory"
                                value={formData.subcategory}
                                onChange={handleChange}
                                className="w-full p-3 border rounded"
                                required
                            >
                                <option value="">Select Subcategory</option>
                                {subcategoriesMap[formData.category].map((sub) => (
                                    <option key={sub} value={sub}>
                                        {sub}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Catering-specific options */}
                        {formData.category === "Catering" && (
                            <>
                                <select
                                    name="foodType"
                                    value={formData.foodType}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded"
                                    required
                                >
                                    <option value="">Select Food Type</option>
                                    <option value="Veg">Veg</option>
                                    <option value="Non-Veg">Non-Veg</option>
                                    <option value="Both">Both</option>
                                </select>

                                <select
                                    name="mealTime"
                                    value={formData.mealTime}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded"
                                    required
                                >
                                    <option value="">Select Meal Time</option>
                                    <option value="Breakfast">Breakfast</option>
                                    <option value="Tiffen">Tiffen</option>
                                    <option value="Lunch">Lunch</option>
                                    <option value="Snacks">Snacks</option>
                                    <option value="Dinner">Dinner</option>
                                </select>
                                <select
                                    name="cuisine"
                                    value={formData.cuisine}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded"
                                    required
                                >
                                    <option value="">Select cuisine</option>
                                    <option value="SouthIndian">South Indian</option>
                                    <option value="NorthIndian">North Indian</option>
                                    <option value="Italian">Italian</option>
                                    <option value="Japanese">Japanese</option>
                                    <option value="Chinese">Chinese</option>
                                    <option value="French">French</option>
                                </select>
                            </>
                        )}
                        {formData.subcategory === "Main Course" && (
                            <>
                                <select
                                    name="foodModel"
                                    value={formData.foodModel}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded"
                                    required
                                >
                                    <option value="">Select Food Model</option>
                                    <option value="Rice Items">Rice Item</option>
                                    <option value="Curries">Curries</option>
                                    <option value="Flour Items">Both</option>
                                    <option value="BreakFast">BreakFast</option>
                                    <option value="Pasta">Pasta</option>
                                    <option value="Pizza">Pizza</option>
                                    <option value="Rice & Noodles">Rice & Noodles</option>
                                    <option value="Tiffin Dishes">Tiffin Dishes</option>
                                    <option value="Side Dishes">Side Dishes</option>
                                    <option value="Soups">Soups</option>
                                    <option value="Sushi">Sushi</option>
                                    <option value="Dishes">Dishes</option>
                                    <option value="Specials">Specials</option>

                                </select>
                            </>
                        )}

                        {formData.subcategory === "Games / Fun Activities" && (
                            <>
                                <select
                                    name="gamesAges"
                                    value={formData.gamesAges}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded"
                                    required
                                >
                                    <option value="">Select gamesAges</option>
                                    <option value="Kids">Kids</option>
                                    <option value="Adults">Adults</option>
                                    <option value="Flour Items">Both</option>
                                    <option value="Old Ages">Old Ages</option>

                                </select>
                            </>
                        )}
                        {formData.subcategory === "Photo/Videography Team" && (
                            <>
                                <select
                                    name="PhotographyPackage"
                                    value={formData.PhotographyPackage}
                                    onChange={handleChange}
                                    className="w-full p-3 border rounded"
                                    required
                                >
                                    <option value="">Select output Type</option>
                                    <option value="Basic">Basic</option>
                                    <option value="Cinematic">Cinematic</option>
                                    <option value="Drone">Drone</option>
                                    <option value="Hightlights">Hightlights</option>
                                </select>
                            </>
                        )}

                        <textarea
                            name="description"
                            rows="3"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Description"
                            className="w-full p-3 border rounded"
                        ></textarea>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full p-3 border rounded"
                        />

                        {preview && (
                            <img
                                src={preview}
                                className="h-32 w-32 object-cover mt-2 rounded"
                            />
                        )}

                        <button
                            type="button"
                            onClick={editingId ? handleUpdate : handleSubmit}
                            className="w-full bg-blue-600 text-white p-3 rounded"
                        >
                            {editingId ? "Update Item" : "Add Item"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="w-full bg-gray-500 text-white p-3 rounded"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </form>
                </div>

                {/* TABLE */}
                <div className="bg-white p-6 shadow-md rounded-xl overflow-x-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Added Items</h2>

                        {/* FILTER SECTION */}
                        <div className="flex space-x-3">
                            <select
                                className="border p-2 rounded"
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            >
                                <option value="">All Categories</option>
                                {Object.keys(subcategoriesMap).map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            <select
                                className="border p-2 rounded"
                                onChange={(e) => setFilters({ ...filters, subcategory: e.target.value })}
                            >
                                <option value="">All Subcategories</option>
                                {filters.category &&
                                    subcategoriesMap[filters.category]?.map((sub) => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                            </select>

                            <select
                                className="border p-2 rounded"
                                onChange={(e) => setFilters({ ...filters, mealTime: e.target.value })}
                            >
                                <option value="">Meal Time</option>
                                <option value="Breakfast">Breakfast</option>
                                <option value="Tiffen">Tiffen</option>
                                <option value="Lunch">Lunch</option>
                                <option value="Snacks">Snacks</option>
                                <option value="Dinner">Dinner</option>
                            </select>

                            <select
                                className="border p-2 rounded"
                                onChange={(e) => setFilters({ ...filters, foodType: e.target.value })}
                            >
                                <option value="">Food Type</option>
                                <option value="Veg">Veg</option>
                                <option value="Non-Veg">Non-Veg</option>
                                <option value="Both">Both</option>
                            </select>

                            <select
                                className="border p-2 rounded"
                                onChange={(e) => setFilters({ ...filters, cuisine: e.target.value })}
                            >
                                <option value="">Cuisine</option>
                                <option value="SouthIndian">South Indian</option>
                                <option value="NorthIndian">North Indian</option>
                                <option value="Italian">Italian</option>
                                <option value="Japanese">Japanese</option>
                                <option value="Chinese">Chinese</option>
                                <option value="French">French</option>
                            </select>

                            <button
                                className="bg-red-600 text-white px-4 py-1 rounded"
                                onClick={deleteSelected}
                            >
                                Delete Selected
                            </button>
                        </div>
                    </div>


                    <table className="w-full border text-sm">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="p-2 border">
                                    <input
                                        type="checkbox"
                                        onChange={(e) =>
                                            setSelectedItems(
                                                e.target.checked ? items.map((i) => i._id) : []
                                            )
                                        }
                                    />
                                </th>
                                <th className="p-2 border">S.no</th>
                                <th className="p-2 border">Image</th>
                                <th className="p-2 border">Name</th>
                                <th className="p-2 border">Price</th>
                                <th className="p-2 border">Category</th>
                                <th className="p-2 border">Subcategory</th>
                                <th className="p-2 border">Food Type</th>
                                <th className="p-2 border">Meal Time</th>
                                <th className="p-2 border">Cuisine</th>
                                <th className="p-2 border">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.length > 0 ? (
                                items
                                    .filter((item, index) =>
                                        (!filters.category || (item.category || "").toLowerCase() === filters.category.toLowerCase()) &&
                                        (!filters.subcategory || (item.subcategory || "").toLowerCase() === filters.subcategory.toLowerCase()) &&
                                        (!filters.mealTime || (item.mealTime || "").toLowerCase() === filters.mealTime.toLowerCase()) &&
                                        (!filters.foodType || (item.foodType || "").toLowerCase() === filters.foodType.toLowerCase()) &&
                                        (!filters.cuisine || (item.cuisine || "").toLowerCase() === filters.cuisine.toLowerCase())
                                    )
                                    .map((item, index) => (
                                        <tr key={item._id} className="text-center">
                                            <td className="border p-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(item._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedItems([...selectedItems, item._id]);
                                                        } else {
                                                            setSelectedItems(
                                                                selectedItems.filter((id) => id !== item._id)
                                                            );
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td className="border p-2">{index + 1}</td>
                                            <td className="border p-2">
                                                <img
                                                    src={`http://localhost:4000/uploads/vendorItems/${item.image}`}
                                                    className="h-12 w-12 object-cover mx-auto rounded"
                                                />
                                            </td>

                                            <td className="border p-2">{item.name}</td>
                                            <td className="border p-2">₹{item.price}</td>
                                            <td className="border p-2">{item.category}</td>
                                            <td className="border p-2">{item.subcategory}</td>
                                            <td className="border p-2">{item.foodType || "-"}</td>
                                            <td className="border p-2">{item.mealTime || "-"}</td>
                                            <td className="border p-2">{item.cuisine || "-"}</td>

                                            <td className="border p-2 space-x-2">
                                                <button
                                                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                                                    onClick={() => startEditing(item)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="bg-red-600 text-white px-2 py-1 rounded"
                                                    onClick={() => handleDelete(item._id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center p-4 text-gray-500">
                                        No items added yet!
                                    </td>
                                </tr>
                            )}

                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

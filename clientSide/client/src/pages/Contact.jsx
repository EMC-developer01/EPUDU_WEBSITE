"use client";

import { useState } from "react";
import axios from "axios";
import Header from "./common/Header";
import Banner from "./common/Banner";
import Footer from "./common/Footer";

export default function Contact() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        message: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await axios.post("http://localhost:4000/api/client/contact/send", form);
            alert("Message sent successfully!");
            setForm({ name: "", email: "", message: "" });
        } catch {
            alert("Failed to send message");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />
            <Banner title="Contact Us" />

            <section className="w-full px-4 sm:px-6 lg:px-12 py-12">
                <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                    {/* LEFT CONTENT */}
                    <div className="text-center lg:text-left space-y-4">
                        <h2 className="text-3xl sm:text-4xl font-bold">
                            Let’s Talk 👋
                        </h2>

                        <p className="text-gray-600 text-sm sm:text-base">
                            Have a question, idea, or event in mind?
                            Fill out the form and we’ll get back to you shortly.
                        </p>

                        <div className="text-gray-700 space-y-2 text-sm sm:text-base">
                            <p><b>Email:</b> info@epudu.com</p>
                            <p><b>contact:</b> 9030406896</p>
                            <p><b>Support:</b> Available 24/7</p>
                        </div>
                    </div>

                    {/* FORM */}
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 space-y-4 w-full"
                    >
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Your Name"
                            className="w-full border rounded-lg p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Your Email"
                            className="w-full border rounded-lg p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />

                        <textarea
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            placeholder="Your Message"
                            rows="5"
                            className="w-full border rounded-lg p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <button
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm sm:text-base hover:bg-blue-700 transition"
                        >
                            {loading ? "Sending..." : "Send Message"}
                        </button>
                    </form>

                </div>
            </section>

            <Footer />
        </>
    );
}

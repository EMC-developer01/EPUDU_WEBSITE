"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Power, Video } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const API = `${API_URL}/api/admin/client-homepage-videos`;
const S3_BASE = `https://${import.meta.env.VITE_AWS_BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/`;

function ClientHomepageVideo() {
  const [videos, setVideos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [preview, setPreview] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    video: null,
    title: "",
    isActive: true,
  });

  // ✅ S3 Upload (same as invitation cards)
  const uploadFile = async (file) => {
    const res = await fetch(`${API_URL}/api/get-upload-url/homepageVideos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
      }),
    });

    const { uploadUrl, key } = await res.json();

    if (!key) throw new Error("No key from backend");

    await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    return key;
  };

  // fetch
  const fetchVideos = async () => {
    const res = await axios.get(`${API}/all`);
    setVideos(res.data);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // handle change
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "video") {
      setForm({ ...form, video: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // ✅ UPDATED SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    let videoKey = form.video;

    // upload only if new file
    if (form.video instanceof File) {
      videoKey = await uploadFile(form.video);
    }

    const payload = {
      title: form.title,
      isActive: form.isActive,
      video: videoKey,
    };

    console.log("Payload:", payload); // debug

    if (editingId) {
      await axios.put(`${API}/update/${editingId}`, payload);
    } else {
      await axios.post(`${API}/add`, payload);
    }

    resetForm();
    fetchVideos();
  };

  // edit
  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      video: null,
      title: item.title,
      isActive: item.isActive,
    });

    setPreview(`${S3_BASE}${item.video}`);
  };

  // toggle
  const toggleStatus = async (id) => {
    await axios.patch(`${API}/status/${id}`);
    fetchVideos();
  };

  const resetForm = () => {
    setForm({ video: null, title: "", isActive: true });
    setEditingId(null);
    setPreview(null);
  };

  // filters
  const filteredVideos = videos
    .filter((v) =>
      statusFilter === "all"
        ? true
        : statusFilter === "active"
          ? v.isActive
          : !v.isActive
    )
    .filter((v) =>
      v.title.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Client Homepage Videos" />

        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* FORM */}
            <div className="bg-white rounded-xl shadow-md border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Video size={18} />
                {editingId ? "Edit Video" : "Add Video"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="file"
                  name="video"
                  accept="video/*"
                  onChange={handleChange}
                  className="border rounded-lg p-2 w-full"
                  required={!editingId}
                />

                {preview && (
                  <video
                    src={preview}
                    controls
                    className="w-full h-40 object-cover rounded-lg border"
                  />
                )}

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Video Title"
                  className="border rounded-lg p-2 w-full"
                  required
                />

                <select
                  name="isActive"
                  value={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.value === "true" })
                  }
                  className="border rounded-lg p-2 w-full"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>

                <Button className="w-full bg-indigo-600 text-white">
                  {editingId ? "Update Video" : "Add Video"}
                </Button>
              </form>
            </div>

            {/* TABLE */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredVideos.map((item, i) => (
                    <TableRow key={item._id}>
                      <TableCell>{i + 1}</TableCell>

                      <TableCell>
                        <video className="w-16 h-12 rounded-lg object-cover" autoPlay muted loop>
                          <source src={`${S3_BASE}${encodeURI(item.video)}`} />
                        </video>
                      </TableCell>

                      <TableCell>{item.title}</TableCell>

                      <TableCell>
                        {item.isActive ? "Active" : "Inactive"}
                      </TableCell>

                      <TableCell className="flex justify-center gap-2">
                        <Button size="sm" onClick={() => handleEdit(item)}>
                          <Edit size={14} />
                        </Button>

                        <Button size="sm" onClick={() => toggleStatus(item._id)}>
                          <Power size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default ClientHomepageVideo;
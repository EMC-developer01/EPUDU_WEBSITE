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

const API = "http://localhost:4000/api/admin/client-homepage-videos";
const VIDEO_BASE = "http://localhost:4000/uploads/homepageVideos";

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

  /* fetch videos */
  const fetchVideos = async () => {
    const res = await axios.get(`${API}/all`);
    setVideos(res.data);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  /* handlers */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "video") {
      setForm({ ...form, video: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(form).forEach((k) => formData.append(k, form[k]));

    editingId
      ? await axios.put(`${API}/update/${editingId}`, formData)
      : await axios.post(`${API}/add`, formData);

    resetForm();
    fetchVideos();
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      video: null,
      title: item.title,
      isActive: item.isActive,
    });
    setPreview(`${VIDEO_BASE}/${item.video}`);
  };

  const toggleStatus = async (id, status) => {
    await axios.patch(`${API}/status/${id}`, { isActive: !status });
    fetchVideos();
  };

  const resetForm = () => {
    setForm({ video: null, title: "", isActive: true });
    setEditingId(null);
    setPreview(null);
  };

  /* filters */
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

            {/* LEFT FORM */}
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

                <Button className="w-full">
                  {editingId ? "Update Video" : "Add Video"}
                </Button>
              </form>
            </div>

            {/* RIGHT TABLE */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md border overflow-x-auto">
              <div className="p-4 border-b flex flex-wrap justify-between gap-3">
                <h2 className="text-lg font-semibold">Homepage Videos</h2>

                <div className="flex gap-2">
                  <input
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded-lg px-3 py-2"
                  />

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border rounded-lg px-3 py-2"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <Table>
                <TableCaption>Client homepage videos</TableCaption>
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
                  {filteredVideos.length ? (
                    filteredVideos.map((item, i) => (
                      <TableRow key={item._id}>
                        <TableCell>{i + 1}</TableCell>

                        <TableCell>
                          <video
                            src={`${VIDEO_BASE}/${item.video}`}
                            className="w-16 h-12 rounded-lg object-cover"
                          />
                        </TableCell>

                        <TableCell>{item.title}</TableCell>

                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              item.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </span>
                        </TableCell>

                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit size={14} />
                            </Button>

                            <Button
                              size="sm"
                              variant={item.isActive ? "destructive" : "default"}
                              onClick={() =>
                                toggleStatus(item._id, item.isActive)
                              }
                            >
                              <Power size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-6 text-gray-500"
                      >
                        No videos found 😕
                      </TableCell>
                    </TableRow>
                  )}
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

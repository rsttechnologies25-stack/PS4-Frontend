"use client";

import { useEffect, useState } from "react";
import { API_URL, fetchWithAuth } from "@/lib/api";
import {
    Plus,
    Trash2,
    Megaphone,
    ToggleLeft,
    ToggleRight,
    Loader2,
    Edit3,
    X,
    Check,
    ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Announcement {
    id: string;
    message: string;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
}

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editMessage, setEditMessage] = useState("");

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch(`${API_URL}/announcements`);
            const data = await res.json();
            setAnnouncements(data);
        } catch (error) {
            console.error("Error fetching announcements:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleAdd = async () => {
        if (!newMessage.trim()) return;
        setAdding(true);
        try {
            const res = await fetchWithAuth(`${API_URL}/announcements`, {
                method: "POST",
                body: JSON.stringify({
                    message: newMessage.trim(),
                    sortOrder: announcements.length,
                }),
            });
            if (res.ok) {
                setNewMessage("");
                fetchAnnouncements();
            }
        } catch (error) {
            console.error("Error adding announcement:", error);
        } finally {
            setAdding(false);
        }
    };

    const handleToggle = async (id: string) => {
        try {
            await fetchWithAuth(`${API_URL}/announcements/${id}/toggle`, {
                method: "PATCH",
            });
            fetchAnnouncements();
        } catch (error) {
            console.error("Error toggling announcement:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this announcement?")) return;
        try {
            await fetchWithAuth(`${API_URL}/announcements/${id}`, {
                method: "DELETE",
            });
            fetchAnnouncements();
        } catch (error) {
            console.error("Error deleting announcement:", error);
        }
    };

    const handleEdit = async (id: string) => {
        if (!editMessage.trim()) return;
        try {
            await fetchWithAuth(`${API_URL}/announcements/${id}`, {
                method: "PUT",
                body: JSON.stringify({ message: editMessage.trim() }),
            });
            setEditingId(null);
            fetchAnnouncements();
        } catch (error) {
            console.error("Error updating announcement:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="animate-spin text-[#EA580C]" size={48} />
                <p className="font-bold text-[#7C2D12]">Loading announcements...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-brand-maroon tracking-tight">Announcement Banner</h1>
                    <p className="text-orange-900/50 mt-2 font-medium italic">
                        Manage scrolling messages shown at the top of the website
                    </p>
                </div>
            </div>

            {/* Add new announcement */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-orange-950/5 border border-orange-100/50">
                <h3 className="text-lg font-bold text-brand-maroon mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-primary" />
                    Add New Message
                </h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        placeholder="e.g. Order before 3:00 PM for next-day delivery!"
                        className="flex-1 px-6 py-4 bg-orange-50/20 border border-orange-100 rounded-2xl focus:ring-4 focus:ring-[#EA580C]/10 focus:border-[#EA580C] outline-none transition-all font-bold placeholder:text-[#7C2D12]/20"
                    />
                    <button
                        onClick={handleAdd}
                        disabled={!newMessage.trim() || adding}
                        className="px-8 py-4 bg-[#EA580C] text-white font-bold rounded-2xl hover:bg-[#C2410C] transition-all transform hover:scale-[1.02] shadow-xl shadow-orange-600/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {adding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                        Add
                    </button>
                </div>
            </div>

            {/* Announcements list */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-orange-950/5 border border-orange-100/50">
                <h3 className="text-lg font-bold text-brand-maroon mb-6 border-b border-orange-100 pb-4 flex items-center gap-2">
                    <Megaphone size={20} className="text-primary" />
                    Active Messages ({announcements.filter((a) => a.isActive).length} / {announcements.length})
                </h3>

                {announcements.length === 0 ? (
                    <div className="text-center py-16">
                        <Megaphone size={48} className="mx-auto text-[#7C2D12]/20 mb-4" />
                        <p className="text-[#7C2D12]/40 font-bold">
                            No announcements yet. Add one above!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {announcements.map((announcement, index) => (
                            <div
                                key={announcement.id}
                                className={cn(
                                    "flex items-center gap-4 p-5 rounded-2xl border transition-all",
                                    announcement.isActive
                                        ? "bg-green-50/50 border-green-200"
                                        : "bg-gray-50 border-gray-200 opacity-60"
                                )}
                            >
                                {/* Order number */}
                                <span className="text-xs font-black text-[#7C2D12]/30 w-6 text-center">
                                    {index + 1}
                                </span>

                                {/* Toggle */}
                                <button
                                    onClick={() => handleToggle(announcement.id)}
                                    className="flex-shrink-0"
                                    title={announcement.isActive ? "Disable" : "Enable"}
                                >
                                    {announcement.isActive ? (
                                        <ToggleRight size={28} className="text-green-600" />
                                    ) : (
                                        <ToggleLeft size={28} className="text-gray-400" />
                                    )}
                                </button>

                                {/* Message */}
                                <div className="flex-1 min-w-0">
                                    {editingId === announcement.id ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={editMessage}
                                                onChange={(e) => setEditMessage(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleEdit(announcement.id)}
                                                className="flex-1 px-4 py-2 border border-orange-200 rounded-xl focus:ring-2 focus:ring-[#EA580C]/20 focus:border-[#EA580C] outline-none font-bold text-sm"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleEdit(announcement.id)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-xl"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="font-bold text-[#7C2D12] text-sm truncate">
                                            {announcement.message}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                {editingId !== announcement.id && (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => {
                                                setEditingId(announcement.id);
                                                setEditMessage(announcement.message);
                                            }}
                                            className="p-2 text-[#7C2D12]/40 hover:text-[#EA580C] hover:bg-orange-50 rounded-xl transition-colors"
                                            title="Edit"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(announcement.id)}
                                            className="p-2 text-[#7C2D12]/40 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

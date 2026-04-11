"use client";

import { useEffect, useState } from "react";
import { API_URL, fetchWithAuth } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
    Star,
    Trash2,
    Loader2,
    MessageSquare,
    User,
    Calendar,
    ShieldCheck,
    ChevronDown
} from "lucide-react";

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("PENDING");
    const [actionId, setActionId] = useState<string | null>(null);
    const [replyingId, setReplyingId] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetchWithAuth(`${API_URL}/reviews/admin/all`);
            if (res.ok) {
                setReviews(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        setActionId(id);
        try {
            const res = await fetchWithAuth(`${API_URL}/reviews/${id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                setReviews(reviews.map(r => r.id === id ? { ...r, status } : r));
            }
        } catch (error) {
            alert("Failed to update status");
        } finally {
            setActionId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this review permanently?")) return;

        setActionId(id);
        try {
            const res = await fetchWithAuth(`${API_URL}/reviews/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setReviews(reviews.filter(r => r.id !== id));
            }
        } catch (error) {
            alert("Error deleting review");
        } finally {
            setActionId(null);
        }
    };

    const handleSaveReply = async (id: string) => {
        setActionId(id);
        try {
            const res = await fetchWithAuth(`${API_URL}/reviews/${id}/reply`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ adminReply: replyText })
            });
            if (res.ok) {
                const updatedReview = await res.json();
                setReviews(reviews.map(r => r.id === id ? updatedReview : r));
                setReplyingId(null);
                setReplyText("");
            }
        } catch (error) {
            alert("Failed to save reply");
        } finally {
            setActionId(null);
        }
    };

    const filteredReviews = reviews.filter(r => r.status === statusFilter);

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-brand-maroon tracking-tight text-secondary">Product Reviews</h1>
                    <p className="text-orange-900/50 mt-1 font-medium italic">Moderate customer feedback and verified purchases</p>
                </div>
                <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                    {["PENDING", "APPROVED", "REJECTED"].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-6 py-2 rounded-xl text-xs font-black tracking-widest transition-all ${statusFilter === s ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:bg-gray-50'}`}
                        >
                            {s} ({reviews.filter(r => r.status === s).length})
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="bg-white/50 backdrop-blur-md p-32 rounded-[2.5rem] border border-orange-100/50 shadow-xl flex flex-col items-center justify-center gap-6">
                    <Loader2 className="animate-spin text-primary" size={48} />
                    <p className="font-bold text-lg italic outfit tracking-wide text-primary/30">Syncing testimonials...</p>
                </div>
            ) : filteredReviews.length === 0 ? (
                <div className="bg-white/50 backdrop-blur-md p-32 rounded-[2.5rem] border border-brand-maroon/10 border-dashed flex flex-col items-center justify-center gap-6 text-orange-900/20">
                    <MessageSquare size={64} className="text-orange-100" />
                    <p className="font-bold text-lg italic outfit tracking-wide text-brand-maroon/30">No {statusFilter.toLowerCase()} reviews to display</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredReviews.map((review) => (
                        <div key={review.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-orange-950/5 border border-orange-100/50 flex flex-col md:flex-row gap-8 group relative hover:border-primary/30 transition-all">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-orange-100"}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full">
                                        {review.product?.name || "Deleted Product"}
                                    </span>
                                </div>

                                <p className="text-brand-maroon text-lg font-medium leading-relaxed italic outfit">
                                    "{review.comment}"
                                </p>

                                <div className="flex items-center gap-8 pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <p className="font-black text-[#7C2D12] outfit leading-none text-sm">{review.customerName}</p>
                                            {review.isVerified && (
                                                <div className="flex items-center gap-1.5 text-green-600 font-bold text-[10px] mt-1 uppercase tracking-widest">
                                                    <ShieldCheck size={12} /> Verified Purchaser
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[#7C2D12]/40 text-[10px] font-black uppercase tracking-widest">
                                        <Calendar size={14} />
                                        {formatDate(review.createdAt)}
                                    </div>
                                </div>

                                {review.adminReply && (
                                    <div className="bg-brand-orange/5 p-6 rounded-2xl border border-brand-orange/10 relative mt-4">
                                        <div className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-2 flex justify-between">
                                            <span>Admin Response</span>
                                            {review.repliedAt && <span>{formatDate(review.repliedAt)}</span>}
                                        </div>
                                        <p className="text-secondary text-sm font-medium italic">"{review.adminReply}"</p>
                                    </div>
                                )}

                                {replyingId === review.id ? (
                                    <div className="space-y-4 pt-4 animate-in slide-in-from-top-2">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Write your response to the customer..."
                                            className="w-full bg-orange-50/50 border border-orange-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-orange-900/20"
                                            rows={3}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleSaveReply(review.id)}
                                                disabled={!!actionId}
                                                className="px-6 py-3 bg-secondary text-white rounded-xl text-[10px] font-black tracking-widest hover:bg-black transition-all shadow-lg uppercase"
                                            >
                                                Save Response
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setReplyingId(null);
                                                    setReplyText("");
                                                }}
                                                className="px-6 py-3 border-2 border-orange-100 text-orange-900/50 rounded-xl text-[10px] font-black tracking-widest hover:bg-orange-50 transition-all uppercase"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : review.status === 'APPROVED' && (
                                    <div className="pt-4">
                                        <button
                                            onClick={() => {
                                                setReplyingId(review.id);
                                                setReplyText(review.adminReply || "");
                                            }}
                                            className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/5 px-4 py-2 rounded-xl transition-all"
                                        >
                                            <MessageSquare size={14} />
                                            {review.adminReply ? "Edit Response" : "Reply to Review"}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 justify-center md:border-l border-gray-100 md:pl-8 min-w-[200px]">
                                {review.status === 'PENDING' && (
                                    <>
                                        <button
                                            onClick={() => handleUpdateStatus(review.id, 'APPROVED')}
                                            disabled={!!actionId}
                                            className="px-6 py-3 bg-green-600 text-white rounded-xl text-[10px] font-black tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 uppercase"
                                        >
                                            Approve Review
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(review.id, 'REJECTED')}
                                            disabled={!!actionId}
                                            className="px-6 py-3 bg-red-500 text-white rounded-xl text-[10px] font-black tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/10 uppercase"
                                        >
                                            Reject Review
                                        </button>
                                    </>
                                )}
                                {review.status === 'REJECTED' && (
                                    <button
                                        onClick={() => handleUpdateStatus(review.id, 'APPROVED')}
                                        disabled={!!actionId}
                                        className="px-6 py-3 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-xl text-[10px] font-black tracking-widest transition-all uppercase"
                                    >
                                        Recover & Approve
                                    </button>
                                )}
                                {review.status === 'APPROVED' && (
                                    <button
                                        onClick={() => handleUpdateStatus(review.id, 'REJECTED')}
                                        disabled={!!actionId}
                                        className="px-6 py-3 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-black tracking-widest transition-all uppercase"
                                    >
                                        Unapprove / Hide
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(review.id)}
                                    disabled={!!actionId}
                                    className="px-6 py-3 text-red-400 hover:text-red-600 text-[10px] font-black tracking-widest hover:bg-red-50 rounded-xl transition-all uppercase flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={14} /> Delete Permanently
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

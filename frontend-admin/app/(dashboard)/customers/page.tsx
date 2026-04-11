"use client";

import { useState, useEffect } from "react";
import { 
    User, Search, Filter, Ban, CheckCircle2, 
    XCircle, FileText, Download, Loader2, 
    AlertCircle, Trash2, Plus,
    Calendar, ShoppingBag, ShieldAlert,
    MoreVertical, Info, Save, ShieldX
} from "lucide-react";
import { API_URL, fetchWithAuth } from "@/lib/api";

type TabType = 'customers' | 'blacklist';

export default function CustomersPage() {
    const [activeTab, setActiveTab] = useState<TabType>('customers');
    const [loading, setLoading] = useState(true);
    const [customers, setCustomers] = useState<any[]>([]);
    const [blacklist, setBlacklist] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    // Modals
    const [noteModal, setNoteModal] = useState<{ isOpen: boolean, user: any | null }>({ isOpen: false, user: null });
    const [newNote, setNewNote] = useState("");
    const [blacklistEmail, setBlacklistEmail] = useState("");
    const [addingToBlacklist, setAddingToBlacklist] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'customers') {
                const res = await fetchWithAuth(`${API_URL}/admin/users`);
                if (res.ok) setCustomers(await res.json());
            } else {
                const res = await fetchWithAuth(`${API_URL}/admin/banned-emails`);
                if (res.ok) setBlacklist(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleBlacklistToggle = async (email: string) => {
        try {
            const res = await fetchWithAuth(`${API_URL}/admin/banned-emails`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Email added to blacklist' });
                if (activeTab === 'blacklist') fetchData();
            } else {
                const err = await res.json();
                setMessage({ type: 'error', text: err.error || 'Blacklist failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        }
    };

    const handleBanToggle = async (id: string) => {
        try {
            const res = await fetchWithAuth(`${API_URL}/admin/users/${id}/ban`, { method: 'PATCH' });
            if (res.ok) {
                const updated = await res.json();
                setCustomers(prev => prev.map(u => u.id === id ? { ...u, isBanned: updated.isBanned } : u));
                setMessage({ type: 'success', text: `User ${updated.isBanned ? 'banned' : 'unbanned'} successfully` });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update user status' });
        }
    };

    const handleSaveNote = async () => {
        if (!noteModal.user) return;
        try {
            const res = await fetchWithAuth(`${API_URL}/admin/users/${noteModal.user.id}/notes`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: newNote })
            });
            if (res.ok) {
                setCustomers(prev => prev.map(u => u.id === noteModal.user.id ? { ...u, adminNotes: newNote } : u));
                setNoteModal({ isOpen: false, user: null });
                setMessage({ type: 'success', text: 'Notes updated' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update notes' });
        }
    };

    const handleAddToBlacklist = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddingToBlacklist(true);
        try {
            const res = await fetchWithAuth(`${API_URL}/admin/banned-emails`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: blacklistEmail })
            });
            if (res.ok) {
                const data = await res.json();
                setBlacklist(prev => [data, ...prev]);
                setBlacklistEmail("");
                setMessage({ type: 'success', text: 'Email blacklisted' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to blacklist email' });
        } finally {
            setAddingToBlacklist(false);
        }
    };

    const handleRemoveFromBlacklist = async (id: string) => {
        try {
            const res = await fetchWithAuth(`${API_URL}/admin/banned-emails/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setBlacklist(prev => prev.filter(item => item.id !== id));
                setMessage({ type: 'success', text: 'Email removed from blacklist' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to remove from blacklist' });
        }
    };

    const handleExportCSV = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/admin/users/export`);
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'customers.csv';
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        } catch (error) {
            console.error("Export failed");
        }
    };

    const filteredCustomers = customers.filter(c => 
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-brand-maroon tracking-tight uppercase outfit italic">
                        Customer <span className="text-brand-orange">Management</span>
                    </h1>
                    <p className="text-orange-900/60 font-medium mt-1">Manage users, analyze stats, and enforce security</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleExportCSV}
                        className="h-14 px-6 bg-white border-2 border-orange-100 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-orange-50 transition-all flex items-center gap-2 text-brand-maroon"
                    >
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-white rounded-3xl border border-orange-100/50 w-fit">
                <button
                    onClick={() => setActiveTab('customers')}
                    className={`h-12 px-8 rounded-2xl font-black text-xs tracking-widest uppercase transition-all ${
                        activeTab === 'customers' ? 'bg-brand-maroon text-white shadow-lg' : 'text-brand-maroon/40 hover:text-brand-maroon'
                    }`}
                >
                    All Customers
                </button>
                <button
                    onClick={() => setActiveTab('blacklist')}
                    className={`h-12 px-8 rounded-2xl font-black text-xs tracking-widest uppercase transition-all ${
                        activeTab === 'blacklist' ? 'bg-brand-orange text-white shadow-lg' : 'text-brand-maroon/40 hover:text-brand-orange'
                    }`}
                >
                    Blacklist
                </button>
            </div>

            {/* Status Message */}
            {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 border animate-in slide-in-from-top-2 ${
                    message.type === 'success' 
                        ? 'bg-green-50 border-green-100 text-green-700' 
                        : 'bg-red-50 border-red-100 text-red-700'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <p className="font-bold text-sm tracking-tight">{message.text}</p>
                    <button onClick={() => setMessage(null)} className="ml-auto opacity-50 hover:opacity-100 uppercase text-[10px] font-black">Dismiss</button>
                </div>
            )}

            {activeTab === 'customers' ? (
                <>
                    {/* Search Bar */}
                    <div className="relative group max-w-2xl">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-maroon/40 group-focus-within:text-brand-orange transition-colors">
                            <Search size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-16 bg-white border-2 border-orange-100 focus:border-brand-orange rounded-3xl pl-16 pr-8 font-bold text-brand-maroon outline-none transition-all shadow-sm group-hover:shadow-md"
                        />
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-[2.5rem] overflow-hidden border border-orange-100/50 shadow-sm relative">
                        {loading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                                <Loader2 className="h-10 w-10 animate-spin text-brand-maroon" />
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-orange-50/30 border-b border-orange-100/50">
                                        <th className="px-8 py-6 text-[10px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Customer</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Date Joined</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Orders</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-orange-900/40 uppercase tracking-[0.2em]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-orange-100/30">
                                    {filteredCustomers.length > 0 ? filteredCustomers.map((user) => (
                                        <tr key={user.id} className="group hover:bg-orange-50/20 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner relative ${
                                                        user.isBanned ? 'bg-red-50 text-red-300' : 'bg-orange-50 text-brand-maroon'
                                                    }`}>
                                                        <User size={20} />
                                                        {user.isBanned && (
                                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-white flex items-center justify-center">
                                                                <ShieldAlert size={8} className="text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className={`font-black tracking-tight outfit ${user.isBanned ? 'text-red-900/40 line-through' : 'text-brand-maroon'}`}>
                                                            {user.name || "Anonymous User"}
                                                        </p>
                                                        <p className="text-xs font-bold text-orange-900/40">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-sm font-bold text-brand-maroon/60">
                                                    <Calendar size={14} className="text-brand-orange" />
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-sm font-black text-brand-maroon">
                                                    <ShoppingBag size={14} className="text-brand-orange" />
                                                    {user._count?.orders || 0}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => {
                                                            setNoteModal({ isOpen: true, user });
                                                            setNewNote(user.adminNotes || "");
                                                        }}
                                                        className="p-3 bg-orange-50 text-brand-maroon hover:bg-brand-maroon hover:text-white rounded-xl transition-all relative group/note"
                                                        title="Admin Notes"
                                                    >
                                                        <FileText size={18} />
                                                        {user.adminNotes && (
                                                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-orange rounded-full border-2 border-white" />
                                                        )}
                                                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-brand-maroon text-white text-[10px] font-black py-1 px-3 rounded-lg opacity-0 group-hover/note:opacity-100 pointer-events-none transition-opacity">Notes</span>
                                                    </button>
                                                    
                                                    <button 
                                                        onClick={() => handleBanToggle(user.id)}
                                                        className={`p-3 rounded-xl transition-all group/ban relative ${
                                                            user.isBanned 
                                                                ? 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white' 
                                                                : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'
                                                        }`}
                                                        title={user.isBanned ? "Unban User" : "Ban User"}
                                                    >
                                                        {user.isBanned ? <CheckCircle2 size={18} /> : <Ban size={18} />}
                                                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-brand-maroon text-white text-[10px] font-black py-1 px-3 rounded-lg opacity-0 group-hover/ban:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                                                            Account {user.isBanned ? "Lift Ban" : "Ban Status"}
                                                        </span>
                                                    </button>

                                                    <button 
                                                        onClick={() => handleBlacklistToggle(user.email)}
                                                        className="p-3 bg-red-600 text-white rounded-xl transition-all hover:bg-red-700 relative group/blacklist"
                                                        title="Blacklist Email"
                                                    >
                                                        <ShieldX size={18} />
                                                        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-brand-maroon text-white text-[10px] font-black py-1 px-3 rounded-lg opacity-0 group-hover/blacklist:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                                                            Email Blacklist
                                                        </span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4 text-orange-900/30">
                                                    <Search size={48} strokeWidth={1} />
                                                    <p className="font-bold text-lg italic">No customers found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Add to Blacklist Form */}
                    <div className="md:col-span-1">
                        <form onSubmit={handleAddToBlacklist} className="bg-white p-8 rounded-[2.5rem] border border-orange-100/50 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                                    <ShieldAlert size={24} />
                                </div>
                                <h3 className="text-xl font-black text-brand-maroon outfit tracking-tight">Email Blacklist</h3>
                            </div>
                            <p className="text-xs font-medium text-orange-900/60 leading-relaxed">
                                Adding an email to the blacklist will permanently block it from registering a new account or logging in.
                            </p>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-orange-900/40 uppercase tracking-[0.2em] ml-1">Target Email</label>
                                    <input 
                                        type="email"
                                        required
                                        placeholder="user@example.com"
                                        value={blacklistEmail}
                                        onChange={(e) => setBlacklistEmail(e.target.value)}
                                        className="w-full h-14 bg-orange-50/50 border-2 border-transparent focus:border-red-500 rounded-xl px-4 font-bold text-brand-maroon outline-none transition-all"
                                    />
                                </div>
                                <button 
                                    disabled={addingToBlacklist || !blacklistEmail}
                                    className="w-full h-14 bg-red-600 text-white rounded-xl font-black text-xs tracking-widest uppercase hover:bg-red-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 shadow-lg shadow-red-600/10"
                                >
                                    {addingToBlacklist ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                    Blacklist Email
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Blacklist List */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-[2.5rem] border border-orange-100/50 shadow-sm overflow-hidden min-h-[400px]">
                            <div className="p-8 border-b border-orange-100/30 flex items-center justify-between">
                                <h4 className="text-[10px] font-black text-orange-900/40 uppercase tracking-[0.3em]">Currently Blacklisted</h4>
                                <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-full uppercase tracking-widest">{blacklist.length} Entries</span>
                            </div>

                            {loading ? (
                                <div className="flex h-64 items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-brand-maroon" />
                                </div>
                            ) : (
                                <div className="divide-y divide-orange-100/30">
                                    {blacklist.length > 0 ? blacklist.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-8 group hover:bg-red-50/10 transition-colors">
                                            <div>
                                                <p className="font-black text-brand-maroon tracking-tight">{item.email}</p>
                                                <p className="text-[10px] font-bold text-orange-900/40 uppercase tracking-widest mt-1">
                                                    Added {new Date(item.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveFromBlacklist(item.id)}
                                                className="p-3 text-orange-900/30 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                title="Remove from Blacklist"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    )) : (
                                        <div className="p-20 text-center flex flex-col items-center gap-4 text-orange-900/30">
                                            <ShieldAlert size={48} strokeWidth={1} />
                                            <p className="font-bold text-lg italic">The blacklist is empty</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Notes Modal */}
            {noteModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-brand-maroon/40 backdrop-blur-md" onClick={() => setNoteModal({ isOpen: false, user: null })} />
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 relative z-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-50 text-brand-orange rounded-2xl">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-brand-maroon outfit tracking-tight leading-none">Internal Notes</h3>
                                    <p className="text-xs font-bold text-orange-900/40 mt-1">{noteModal.user?.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setNoteModal({ isOpen: false, user: null })} className="p-2 hover:bg-orange-50 rounded-full transition-colors text-orange-900/40">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-orange-900/40 uppercase tracking-[0.2em] ml-1">Private Admin Comments</label>
                                <textarea 
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Add notes about this customer here... (e.g. VVIP, frequent refund requests)"
                                    className="w-full h-40 bg-orange-50/50 border-2 border-transparent focus:border-brand-maroon rounded-2xl p-6 font-bold text-brand-maroon outline-none transition-all resize-none"
                                />
                            </div>

                            <button 
                                onClick={handleSaveNote}
                                className="w-full h-16 bg-brand-maroon text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-maroon/20"
                            >
                                <Save size={20} />
                                Save Internal Note
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export default function AdminDashboard() {
    const [complaints, setComplaints] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('complaints'); // 'complaints' or 'events'
    const [globalMessage, setGlobalMessage] = useState({ type: '', text: '' });
    const [showAddNews, setShowAddNews] = useState(false);

    // Search & filter state
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [priorityFilter, setPriorityFilter] = useState('All');

    const [eventForm, setEventForm] = useState({
        title: '',
        category: 'Infrastructure',
        description: '',
        date: new Date().toISOString().split('T')[0],
        location: ''
    });

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchComplaints(), fetchEvents()]);
            setLoading(false);
        };
        loadData();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events');
            setEvents(response.data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        }
    };

    const fetchComplaints = async () => {
        try {
            const response = await api.get('/complaints');
            setComplaints(response.data);
        } catch (error) {
            console.error('Failed to fetch complaints:', error);
            setGlobalMessage({ type: 'error', text: 'Failed to synchronize with server.' });
        }
    };

    const handleUpdate = async (id, status, adminResponse) => {
        try {
            await api.put(`/complaints/${id}`, { status, adminResponse });
            setGlobalMessage({ type: 'success', text: `Report update synchronized successfully.` });
            setTimeout(() => setGlobalMessage({ type: '', text: '' }), 4000);
            fetchComplaints();
        } catch (error) {
            console.error('Update failed:', error);
            setGlobalMessage({ type: 'error', text: 'Failed to submit update.' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to permanently remove this complaint? This action cannot be undone.")) return;
        try {
            await api.delete(`/complaints/${id}`);
            setGlobalMessage({ type: 'success', text: 'Complaint successfully removed from the system.' });
            setTimeout(() => setGlobalMessage({ type: '', text: '' }), 4000);
            fetchComplaints();
        } catch (error) {
            console.error('Delete failed:', error);
            setGlobalMessage({ type: 'error', text: 'Failed to remove complaint.' });
        }
    };

    const handleEventDelete = async (id) => {
        try {
            await api.delete(`/events/${id}`);
            setGlobalMessage({ type: 'success', text: 'News item removed from broadcast.' });
            setTimeout(() => setGlobalMessage({ type: '', text: '' }), 3000);
            fetchEvents();
        } catch (error) {
            setGlobalMessage({ type: 'error', text: 'Failed to delete item.' });
        }
    };

    const handleEventSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/events', eventForm);
            setGlobalMessage({ type: 'success', text: 'News successfully broadcasted to village!' });
            setEventForm({ title: '', category: 'Infrastructure', description: '', date: new Date().toISOString().split('T')[0], location: '' });
            setShowAddNews(false);
            fetchEvents();
            setTimeout(() => setGlobalMessage({ type: '', text: '' }), 4000);
        } catch (error) {
            setGlobalMessage({ type: 'error', text: 'Failed to publish news.' });
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-500 font-medium text-sm">Loading District Dashboard...</p>
        </div>
    );

    const stats = {
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'Pending').length,
        inProgress: complaints.filter(c => c.status === 'In Progress').length,
        resolved: complaints.filter(c => c.status === 'Resolved').length,
    };

    // --- Analytics (computed from the full dataset) ---
    const CATEGORIES = ['Electricity', 'Road', 'Water', 'Sanitization', 'Garbage', 'Other'];
    const categoryCounts = CATEGORIES.map(cat => ({
        name: cat,
        count: complaints.filter(c => c.category === cat).length,
    })).filter(c => c.count > 0);
    const maxCategoryCount = Math.max(1, ...categoryCounts.map(c => c.count));

    const resolutionRate = stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0;

    const resolvedWithTime = complaints.filter(c => c.status === 'Resolved' && c.createdAt && c.updatedAt);
    const avgResolutionDays = resolvedWithTime.length
        ? (resolvedWithTime.reduce((sum, c) => sum + (new Date(c.updatedAt) - new Date(c.createdAt)), 0)
            / resolvedWithTime.length / (1000 * 60 * 60 * 24))
        : 0;

    // --- Filtering ---
    const filteredComplaints = complaints.filter(c => {
        const q = search.trim().toLowerCase();
        const matchesSearch = !q
            || c.title?.toLowerCase().includes(q)
            || c.description?.toLowerCase().includes(q)
            || c.user?.name?.toLowerCase().includes(q)
            || c.village?.toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
        const matchesPriority = priorityFilter === 'All' || c.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('All');
        setCategoryFilter('All');
        setPriorityFilter('All');
    };

    const exportCSV = () => {
        const headers = ['Title', 'Category', 'Priority', 'Status', 'Citizen', 'Village', 'Description', 'Admin Response', 'Filed On'];
        const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
        const rows = filteredComplaints.map(c => [
            c.title, c.category, c.priority, c.status,
            c.user?.name || '', c.village || '',
            c.description, c.adminResponse || '',
            c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''
        ].map(escape).join(','));
        const csv = [headers.map(escape).join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dcms-complaints-${filteredComplaints.length}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">District Console</h2>
                    <p className="text-gray-500 font-medium text-sm mt-1">Official monitoring and village communications.</p>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('complaints')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'complaints' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Complaints
                    </button>
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'events' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Manage News
                    </button>
                </div>
            </div>

            {/* Metrics Header */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-12">
                {[
                    { label: 'Total Reports', value: stats.total, color: 'text-blue-600' },
                    { label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
                    { label: 'In Progress', value: stats.inProgress, color: 'text-blue-600' },
                    { label: 'Resolved', value: stats.resolved, color: 'text-green-600' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</div>
                        <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {globalMessage.text && (
                <div className={`mb-8 p-4 rounded-2xl text-xs font-bold border-l-4 animate-in fade-in zoom-in duration-300 ${globalMessage.type === 'success'
                    ? 'bg-green-50 text-green-800 border-green-500'
                    : 'bg-red-50 text-red-800 border-red-500'
                    }`}>
                    {globalMessage.text}
                </div>
            )}

            {activeTab === 'complaints' ? (
                <div className="space-y-6">
                    {complaints.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                            {/* Complaints by Category */}
                            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Complaints by Category</div>
                                <div className="space-y-4">
                                    {categoryCounts.length === 0 ? (
                                        <p className="text-sm text-gray-400 font-medium">No data yet.</p>
                                    ) : categoryCounts.map(cat => (
                                        <div key={cat.name} className="flex items-center gap-4">
                                            <div className="w-24 text-[11px] font-black text-gray-500 uppercase tracking-wider shrink-0">{cat.name}</div>
                                            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-600 rounded-full transition-all duration-700"
                                                    style={{ width: `${(cat.count / maxCategoryCount) * 100}%` }}
                                                ></div>
                                            </div>
                                            <div className="w-8 text-right text-sm font-black text-gray-900">{cat.count}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Resolution metrics */}
                            <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-lg flex flex-col justify-between">
                                <div>
                                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Resolution Rate</div>
                                    <div className="flex items-end gap-2">
                                        <span className="text-5xl font-black">{resolutionRate}</span>
                                        <span className="text-2xl font-black text-gray-500 mb-1">%</span>
                                    </div>
                                    <div className="mt-3 bg-white/10 rounded-full h-2 overflow-hidden">
                                        <div className="h-full bg-green-500 rounded-full transition-all duration-700" style={{ width: `${resolutionRate}%` }}></div>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-white/10">
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Avg. Resolution Time</div>
                                    <div className="text-2xl font-black">
                                        {resolvedWithTime.length ? `${avgResolutionDays.toFixed(1)} days` : '—'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search & Filter toolbar */}
                    {complaints.length > 0 && (
                        <div className="bg-white p-4 md:p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-3 lg:items-center">
                            <div className="relative flex-1">
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search title, citizen, village..."
                                    className="w-full bg-gray-50 border border-gray-100 pl-11 pr-4 py-3 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-3 lg:flex gap-3">
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider outline-none focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer">
                                    {['All', 'Pending', 'In Progress', 'Resolved', 'Redirected'].map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>)}
                                </select>
                                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider outline-none focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer">
                                    {['All', ...CATEGORIES].map(c => <option key={c} value={c}>{c === 'All' ? 'All Category' : c}</option>)}
                                </select>
                                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider outline-none focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer">
                                    {['All', 'Low', 'Medium', 'High'].map(p => <option key={p} value={p}>{p === 'All' ? 'All Priority' : p}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={resetFilters} className="px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-gray-100 transition-all">Reset</button>
                                <button onClick={exportCSV} className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-md shadow-green-500/10">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Export CSV
                                </button>
                            </div>
                        </div>
                    )}

                    {complaints.length > 0 && (
                        <div className="px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Showing {filteredComplaints.length} of {complaints.length} reports
                        </div>
                    )}

                    {complaints.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                            <h3 className="text-lg font-black text-gray-900">District clear</h3>
                            <p className="mt-1 text-sm text-gray-400 font-medium">All registered reports have been processed.</p>
                        </div>
                    ) : filteredComplaints.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                            <h3 className="text-lg font-black text-gray-900">No matches</h3>
                            <p className="mt-1 text-sm text-gray-400 font-medium">No reports match your current filters.</p>
                        </div>
                    ) : (
                        filteredComplaints.map(complaint => (
                            <AdminComplaintCard
                                key={complaint._id}
                                complaint={complaint}
                                onUpdate={handleUpdate}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Manage News</h3>
                        <button
                            onClick={() => setShowAddNews(!showAddNews)}
                            className="px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                            </svg>
                            {showAddNews ? 'Close Editor' : 'Add News'}
                        </button>
                    </div>

                    {showAddNews && (
                        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-lg animate-in slide-in-from-top-4 duration-300">
                            <form onSubmit={handleEventSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">News Headline</label>
                                        <input
                                            type="text"
                                            value={eventForm.title}
                                            onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                            className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                            placeholder="e.g. Village Clean-up Drive"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Category</label>
                                            <select
                                                value={eventForm.category}
                                                onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                            >
                                                <option value="Infrastructure">Infrastructure</option>
                                                <option value="Sanitization">Sanitization</option>
                                                <option value="Community">Community</option>
                                                <option value="Medical">Medical</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Location</label>
                                            <input
                                                type="text"
                                                value={eventForm.location}
                                                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                                                placeholder="Entire Village"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">Brief Description</label>
                                        <textarea
                                            value={eventForm.description}
                                            onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                                            rows="4"
                                            className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                                            placeholder="Details for the citizens..."
                                            required
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="w-full py-4 bg-gray-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-black/10">
                                        Publish News Broadcast
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-4">
                        {events.length === 0 ? (
                            <div className="bg-white p-16 text-center rounded-[40px] border border-dashed border-gray-100">
                                <p className="text-gray-400 font-bold italic text-sm">No news broadcasts active.</p>
                            </div>
                        ) : (
                            events.map(event => (
                                <div key={event._id} className="bg-white p-8 rounded-3xl border border-gray-100 group hover:shadow-xl hover:shadow-black/5 transition-all">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{event.category}</span>
                                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">•</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(event.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
                                            </div>
                                            <h4 className="text-xl font-black text-gray-900 tracking-tight leading-tight mb-2 group-hover:text-blue-600 transition-colors">{event.title}</h4>
                                            <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-4xl">{event.description}</p>
                                        </div>
                                        <button
                                            onClick={() => handleEventDelete(event._id)}
                                            className="p-3 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                            title="Remove news broadcast"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function AdminComplaintCard({ complaint, onUpdate, onDelete }) {
    const [status, setStatus] = useState(complaint.status);
    const [response, setResponse] = useState(complaint.adminResponse || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isResponding, setIsResponding] = useState(false);

    const handleSubmit = async () => {
        setIsUpdating(true);
        await onUpdate(complaint._id, status, response);
        setIsResponding(false);
        setIsUpdating(false);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="p-8">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 tracking-tight leading-tight">
                            {complaint.title || complaint.category}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1 mb-6">
                            {complaint.description}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onDelete(complaint._id)}
                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Complaint"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setIsResponding(!isResponding)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-blue-500/10"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            Respond
                        </button>
                    </div>
                </div>

                {/* Meta Data Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div>
                        <div className="text-xs text-gray-400 font-medium mb-1">User</div>
                        <div className="text-sm font-bold text-gray-800">{complaint.user?.name || 'Citizen'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 font-medium mb-1">Village</div>
                        <div className="text-sm font-bold text-gray-800">{complaint.village || complaint.user?.village || 'Unknown'}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 font-medium mb-1">Category</div>
                        <div className="text-sm font-bold text-gray-800">{complaint.category}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-400 font-medium mb-1">Priority</div>
                        <div className={`text-sm font-bold ${complaint.priority === 'High' ? 'text-red-600' : complaint.priority === 'Medium' ? 'text-orange-500' : 'text-blue-600'}`}>
                            {complaint.priority || 'Medium'}
                        </div>
                    </div>
                </div>

                {/* Attachment */}
                {complaint.documentUrl && (
                    <div className="mb-8">
                        <div className="text-xs text-gray-400 font-medium mb-2">Attachment</div>
                        <a href={complaint.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                            {/\.(jpg|jpeg|png|webp)$/i.test(complaint.documentUrl) ? (
                                <img src={complaint.documentUrl} alt="Attachment" className="h-28 w-auto rounded-xl border border-gray-100 object-cover hover:ring-4 ring-blue-100 transition-all" />
                            ) : (
                                <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all">
                                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                    View Document
                                </span>
                            )}
                        </a>
                    </div>
                )}

                {/* Toggleable Response Form */}
                {isResponding && (
                    <div className="mt-8 bg-gray-50/50 p-8 rounded-2xl border border-gray-100 animate-in slide-in-from-top-4 duration-300">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Update Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="block w-full bg-white border border-gray-200 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Redirected">Redirected</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-2">Admin Response</label>
                                <textarea
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    placeholder="Enter your response to the complainant..."
                                    rows="4"
                                    className="block w-full bg-white border border-gray-200 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm resize-none"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={isUpdating}
                                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isUpdating ? 'Updating...' : 'Update Complaint'}
                                </button>
                                <button
                                    onClick={() => setIsResponding(false)}
                                    className="px-8 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-bold rounded-lg transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Previous Response Display */}
                {complaint.adminResponse && !isResponding && (
                    <div className="mt-6 bg-blue-50/60 p-5 rounded-xl border border-blue-100/50">
                        <div className="text-xs font-bold text-blue-800 mb-1.5 uppercase tracking-wide opacity-80">Previous Response:</div>
                        <p className="text-blue-700 text-sm font-medium leading-relaxed">
                            {complaint.adminResponse}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

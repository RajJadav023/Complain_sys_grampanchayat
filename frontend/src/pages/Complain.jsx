import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';
import ScrollReveal from '../components/ScrollReveal';

export default function Complain() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        category: 'Electricity',
        priority: 'Medium',
        description: '',
        address: '',
        documentUrl: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [fileName, setFileName] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: t('complain.fileTooLarge', 'File is too large. Maximum size is 5MB.') });
            e.target.value = '';
            return;
        }

        setIsUploading(true);
        setMessage({ type: '', text: '' });
        try {
            const uploadData = new FormData();
            uploadData.append('file', file);
            const res = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, documentUrl: res.data.url }));
            setFileName(file.name);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || t('complain.uploadError', 'Upload failed. Please try again.')
            });
            e.target.value = '';
        } finally {
            setIsUploading(false);
        }
    };

    const removeAttachment = () => {
        setFormData(prev => ({ ...prev, documentUrl: '' }));
        setFileName('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setIsSubmitting(true);

        try {
            const payload = {
                title: formData.title,
                category: formData.category,
                priority: formData.priority,
                description: formData.description,
                locationDetails: {
                    address: formData.address
                },
                documentUrl: formData.documentUrl
            };
            await api.post('/complaints', payload);
            setMessage({ type: 'success', text: t('complain.success') });

            // Clear form
            setFormData({
                title: '',
                category: 'Electricity',
                priority: 'Medium',
                description: '',
                address: '',
                documentUrl: ''
            });
            setFileName('');

            setTimeout(() => {
                navigate('/status');
            }, 3000);

        } catch (error) {
            console.error('Failed to register complaint:', error.response?.data?.message || error.message);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || t('complain.error')
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="mb-10 text-center">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t('complain.title')}</h1>
                <p className="mt-2 text-gray-500 font-medium tracking-tight">{t('complain.subtitle')}</p>
            </ScrollReveal>

            <ScrollReveal delay={200} className="bg-white rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-12">
                    {message.text && (
                        <div className={`mb-10 p-5 rounded-3xl text-sm font-bold border-l-4 animate-in fade-in slide-in-from-top-4 duration-500 ${message.type === 'success'
                            ? 'bg-green-50 text-green-800 border-green-500'
                            : 'bg-red-50 text-red-800 border-red-500'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('complain.labels.title')}</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="block w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-700 placeholder-gray-300"
                                placeholder={t('complain.placeholders.title')}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('complain.labels.category')}</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="block w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-700"
                                >
                                    {['Electricity', 'Road', 'Water', 'Sanitization', 'Garbage', 'Other'].map(cat => (
                                        <option key={cat} value={cat}>{t(`complain.categories.${cat}`)}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('complain.labels.priority')}</label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="block w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-700"
                                >
                                    {['Low', 'Medium', 'High'].map(prio => (
                                        <option key={prio} value={prio}>{t(`complain.priorities.${prio}`)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('complain.labels.location')}</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="block w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-gray-700 placeholder-gray-300"
                                placeholder={t('complain.placeholders.location')}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex justify-between">
                                {t('complain.labels.description')}
                                <span className={`${formData.description.length > 200 ? 'text-red-500' : 'text-gray-300'}`}>{formData.description.length}/300</span>
                            </label>
                            <textarea
                                name="description"
                                rows={3}
                                maxLength={300}
                                value={formData.description}
                                onChange={handleChange}
                                className="block w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium text-gray-700 placeholder-gray-300 resize-none"
                                placeholder={t('complain.placeholders.description')}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
                                {t('complain.labels.attachment', 'Attach Photo / Document (Optional)')}
                            </label>
                            {formData.documentUrl ? (
                                <div className="flex items-center justify-between gap-4 px-5 py-4 bg-green-50 border border-green-100 rounded-2xl">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-bold text-green-800 truncate">{fileName || t('complain.attached', 'File attached')}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeAttachment}
                                        className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 shrink-0"
                                    >
                                        {t('complain.remove', 'Remove')}
                                    </button>
                                </div>
                            ) : (
                                <label className={`flex flex-col items-center justify-center gap-2 px-5 py-8 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}>
                                    {isUploading ? (
                                        <>
                                            <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">{t('complain.uploading', 'Uploading...')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <span className="text-[11px] font-bold text-gray-400">{t('complain.uploadHint', 'Click to upload a photo or PDF (max 5MB)')}</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,application/pdf"
                                        onChange={handleFileChange}
                                        disabled={isUploading}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        <div className="pt-8">
                            <button
                                type="submit"
                                disabled={isSubmitting || isUploading}
                                className={`w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                            >
                                {isSubmitting ? t('complain.submitting') : t('complain.submit')}
                            </button>
                        </div>
                    </form>
                </div>
            </ScrollReveal>
        </div>
    );
}

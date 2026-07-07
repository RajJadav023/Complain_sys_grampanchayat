import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useTranslation } from 'react-i18next';
import ScrollReveal from '../components/ScrollReveal';

export default function Status() {
    const { t } = useTranslation();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const response = await api.get('/complaints/my');
                setComplaints(response.data);
            } catch (error) {
                console.error('Failed to fetch status:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchComplaints();

        // Real-time tracking: Poll every 30 seconds
        const interval = setInterval(fetchComplaints, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-6"></div>
            <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">{t('status.syncing')}</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="mb-12 flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">{t('status.title')}</h2>
                    <p className="text-gray-500 font-medium mt-2">{t('status.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t('status.liveTracking')}</span>
                </div>
            </ScrollReveal>

            {complaints.length === 0 ? (
                <ScrollReveal delay={200}>
                    <div className="bg-white rounded-[40px] border-2 border-dashed border-gray-100 p-20 text-center">
                        <h3 className="text-xl font-black text-gray-900 mb-2">{t('status.noReports')}</h3>
                        <p className="text-gray-400 font-medium">{t('status.noReportsDesc')}</p>
                    </div>
                </ScrollReveal>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {complaints.map((complaint, i) => (
                        <ScrollReveal key={complaint._id} delay={i * 100}>
                            <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.06)] transition-all duration-500 overflow-hidden">
                                <div className="p-6 md:p-8">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-gray-50 pb-6 mb-6">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${complaint.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' :
                                                complaint.status === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                                                    complaint.status === 'Resolved' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
                                                }`}>
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-[10px] font-black tracking-widest text-blue-600 uppercase">{t(`complain.categories.${complaint.category}`)}</span>
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border ${complaint.priority === 'High' ? 'bg-red-50 text-red-700 border-red-100' :
                                                        complaint.priority === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-gray-50 text-gray-600 border-gray-200'
                                                        }`}>
                                                        {t(`complain.priorities.${complaint.priority}`)} {t('status.labels.priority')}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-black text-gray-900 tracking-tight">{complaint.title || `Report #${complaint._id.slice(-6).toUpperCase()}`}</h3>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {new Date(complaint.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-300">•</span>
                                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-lg">
                                                        {complaint.village || t('status.labels.village')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end shrink-0">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border animate-in fade-in duration-1000 ${complaint.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                complaint.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                    complaint.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-700 border-gray-100'
                                                }`}>
                                                {t(`status.states.${complaint.status}`)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t('status.labels.description')}</h4>
                                            <p className="text-gray-600 text-sm font-medium leading-relaxed">
                                                {complaint.description}
                                            </p>
                                        </div>

                                        {complaint.documentUrl && (
                                            <div>
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t('status.labels.attachment', 'Attachment')}</h4>
                                                <a href={complaint.documentUrl} target="_blank" rel="noopener noreferrer" className="inline-block group/att">
                                                    {/\.(jpg|jpeg|png|webp)$/i.test(complaint.documentUrl) ? (
                                                        <img src={complaint.documentUrl} alt="Complaint attachment" className="h-32 w-auto rounded-2xl border border-gray-100 object-cover group-hover/att:ring-4 ring-blue-100 transition-all" />
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-black text-gray-600 uppercase tracking-widest hover:bg-gray-100 transition-all">
                                                            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                            View Document
                                                        </span>
                                                    )}
                                                </a>
                                            </div>
                                        )}

                                        {complaint.adminResponse ? (
                                            <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-50 animate-in slide-in-from-bottom-2 duration-700">
                                                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center">
                                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 21.494c2.107-1.127 3.99-2.73 5.49-4.577m-11 0c1.503 1.936 3.444 3.652 5.51 4.782" />
                                                    </svg>
                                                    {t('status.labels.officialResponse')}
                                                </h4>
                                                <p className="text-gray-700 text-sm font-black italic tracking-tight leading-relaxed">
                                                    "{complaint.adminResponse}"
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest">{t('status.labels.awaiting')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            )}
        </div>
    );
}

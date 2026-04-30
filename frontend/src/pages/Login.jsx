import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Login() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const changeLanguage = (e) => {
        i18n.changeLanguage(e.target.value);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setIsSubmitting(true);

        try {
            const response = await api.post('/auth/login', formData);
            login(response.data);
            setMessage({ type: 'success', text: t('auth.login.success') });

            setTimeout(() => {
                if (response.data.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            }, 1000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || t('auth.login.error')
            });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans relative">
            {/* Language Selector */}
            <div className="absolute top-6 right-6 z-50">
                <div className="relative">
                    <select
                        onChange={changeLanguage}
                        value={i18n.language}
                        className="appearance-none bg-white border border-gray-200 text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-xl px-5 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer hover:bg-gray-50 shadow-sm"
                    >
                        <option value="en">English</option>
                        <option value="gu">ગુજરાતી</option>
                        <option value="hi">हिन्दी</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
            {/* Left Side: Branding & Info */}
            <div className="hidden md:flex md:w-1/2 bg-blue-600 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 L100 0 L100 100 Z" fill="white" />
                    </svg>
                </div>
                <div className="relative z-10 max-w-lg text-white">
                    <div className="bg-white/10 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-lg border border-white/20">
                        <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h1 className="text-6xl font-black mb-6 tracking-tighter">DCMS Portal</h1>
                    <p className="text-xl text-blue-100 leading-relaxed font-medium">
                        Digitizing village governance.
                        A secure, transparent platform for grievance redressal and community empowerement.
                    </p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    <div className="bg-white p-10 rounded-3xl shadow-[0_20px_50px_rgba(8,112,184,0.07)] border border-gray-100">
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('auth.login.title')}</h2>
                            <p className="text-gray-500 font-medium mt-1">{t('auth.login.subtitle')}</p>
                        </div>

                        {message.text && (
                            <div className={`mb-8 p-4 rounded-2xl text-sm font-bold border-l-4 animate-in fade-in slide-in-from-top-4 duration-500 ${message.type === 'success'
                                ? 'bg-green-50 text-green-800 border-green-500 shadow-sm'
                                : 'bg-red-50 text-red-800 border-red-500 shadow-sm'
                                }`}>
                                <span>{message.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder-gray-300 font-medium text-gray-700 bg-gray-50/50"
                                placeholder={t('auth.login.email')}
                                required
                            />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all placeholder-gray-300 font-medium text-gray-700 bg-gray-50/50"
                                placeholder={t('auth.login.password')}
                                required
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'
                                    }`}
                            >
                                {isSubmitting ? t('auth.login.authorizing') : t('auth.login.signIn')}
                            </button>
                        </form>

                        <div className="mt-10 text-center text-sm">
                            <span className="text-gray-500 font-medium">{t('auth.login.newToDCMS')} </span>
                            <Link to="/register" className="font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest text-xs">
                                {t('auth.login.createAccount')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

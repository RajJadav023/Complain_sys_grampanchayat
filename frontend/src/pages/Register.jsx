import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function Register() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        pincode: '',
        village: '',
        address: '',
        password: '',
        confirmPassword: ''
    });
    const [isFetchingPin, setIsFetchingPin] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const changeLanguage = (e) => {
        i18n.changeLanguage(e.target.value);
    };

    // Auto-fetch Village based on PIN Code
    useEffect(() => {
        if (formData.pincode.length === 6) {
            const fetchVillage = async () => {
                setIsFetchingPin(true);
                try {
                    const response = await axios.get(`https://api.postalpincode.in/pincode/${formData.pincode}`);
                    const data = response.data[0];
                    if (data.Status === "Success") {
                        // We take the first post office name as the village/area
                        setFormData(prev => ({ ...prev, village: data.PostOffice[0].Name }));
                        setMessage({ type: 'success', text: `${t('auth.register.recognizing')} ${data.PostOffice[0].Division}` });
                        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                    } else {
                        setMessage({ type: 'error', text: t('auth.register.invalidPin') });
                    }
                } catch (err) {
                    console.error("PIN fetch error", err);
                } finally {
                    setIsFetchingPin(false);
                }
            };
            fetchVillage();
        }
    }, [formData.pincode, t]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: t('auth.register.mismatch') });
            return;
        }

        setIsSubmitting(true);

        try {
            await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                pincode: formData.pincode,
                village: formData.village,
                address: formData.address,
                password: formData.password,
                role: 'user'
            });

            setMessage({ type: 'success', text: t('auth.register.success') });

            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || t('auth.register.error')
            });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row-reverse font-sans relative">
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
                        <path d="M100 100 L0 0 L0 100 Z" fill="white" />
                    </svg>
                </div>
                <div className="relative z-10 max-w-lg text-white">
                    <div className="bg-white/10 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 backdrop-blur-lg border border-white/20">
                        <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h1 className="text-6xl font-black mb-6 tracking-tighter">DCMS Portal</h1>
                    <p className="text-blue-100 text-lg font-medium leading-relaxed italic opacity-80">
                        "Building a transparent bridge between citizens and local governance."
                    </p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-gray-50">
                <div className="w-full max-w-lg">
                    <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-100">
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('auth.register.title')}</h2>
                            <p className="text-gray-400 text-sm font-medium mt-1">{t('auth.register.subtitle')}</p>
                        </div>

                        {message.text && (
                            <div className={`mb-8 p-4 rounded-2xl text-xs font-bold border-l-4 animate-in fade-in slide-in-from-top-2 duration-500 ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-500' : 'bg-red-50 text-red-800 border-red-500'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{t('auth.register.name')}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="block w-full px-5 py-3.5 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder-gray-300 font-medium text-gray-700 bg-gray-50/50"
                                        placeholder={t('auth.register.name')}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{t('auth.register.email')}</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="block w-full px-5 py-3.5 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder-gray-300 font-medium text-gray-700 bg-gray-50/50"
                                        placeholder={t('auth.register.email')}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{t('auth.register.phone')}</label>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className="block w-full px-5 py-3.5 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder-gray-300 font-medium text-gray-700 bg-gray-50/50"
                                        placeholder={t('auth.register.phone')}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{t('auth.register.pincode')}</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            maxLength="6"
                                            className="block w-full px-5 py-3.5 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder-gray-300 font-medium text-gray-700 bg-gray-50/50"
                                            placeholder={t('auth.register.pincode')}
                                            required
                                        />
                                        {isFetchingPin && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{t('auth.register.village')}</label>
                                <input
                                    type="text"
                                    name="village"
                                    value={formData.village}
                                    onChange={handleChange}
                                    className="block w-full px-5 py-3.5 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder-gray-300 font-medium text-gray-700 bg-gray-50/50"
                                    placeholder={t('auth.register.village')}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{t('auth.register.address')}</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="block w-full px-5 py-3.5 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder-gray-300 font-medium text-gray-700 bg-gray-50/50"
                                    placeholder={t('auth.register.address')}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{t('auth.register.password')}</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="block w-full px-5 py-3.5 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder-gray-300 font-medium text-gray-700 bg-gray-50/50"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{t('auth.register.confirmPassword')}</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="block w-full px-5 py-3.5 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all placeholder-gray-300 font-medium text-gray-700 bg-gray-50/50"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-5 px-6 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-1'}`}
                            >
                                {isSubmitting ? t('auth.register.registering') : t('auth.register.signUp')}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-[10px]">
                            <span className="text-gray-400 font-black uppercase tracking-widest">{t('auth.register.alreadyHaveAccount')} </span>
                            <Link to="/login" className="font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-[0.2em] ml-2">
                                {t('auth.register.logIn')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

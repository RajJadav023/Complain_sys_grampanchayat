import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const changeLanguage = (e) => {
        i18n.changeLanguage(e.target.value);
    };

    const isActive = (path) => location.pathname === path;

    const linkClass = (path) => `
    px-4 py-2 rounded-2xl transition-all duration-500 text-xs font-black uppercase tracking-widest
    ${isActive(path)
            ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
  `;

    return (
        <nav className="bg-white/80 border-b border-gray-100 sticky top-0 z-50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-blue-500/20 rounded-2xl overflow-hidden h-10 w-10 flex items-center justify-center">
                                <img src="/dcms-logo.png" alt="DCMS Logo" className="h-full w-full object-cover" />
                            </div>
                            <span className="text-gray-900 text-2xl font-black tracking-tight">DCMS</span>
                        </Link>
                    </div>

                    <div className="hidden lg:ml-10 lg:flex lg:items-center lg:space-x-1">
                        <Link to="/" className={linkClass('/')}>{t('navbar.home')}</Link>
                        {user?.role !== 'admin' && (
                            <>
                                <Link to="/complain" className={linkClass('/complain')}>{t('navbar.complain')}</Link>
                                <Link to="/status" className={linkClass('/status')}>{t('navbar.status')}</Link>
                                <Link to="/documents" className={linkClass('/documents')}>{t('navbar.documents') || 'Documents'}</Link>
                            </>
                        )}
                        <Link to="/profile" className={linkClass('/profile')}>{t('navbar.profile')}</Link>
                        <Link to="/about" className={linkClass('/about')}>{t('navbar.about')}</Link>
                        <Link to="/help" className={linkClass('/help')}>{t('navbar.help')}</Link>

                        {user?.role === 'admin' && (
                            <Link to="/admin" className={linkClass('/admin')}>
                                {t('navbar.admin')}
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-8">
                            {user ? (
                                <div className="flex items-center">
                                    <div className="hidden md:flex flex-col items-end mr-6">
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1.5">{t('navbar.authenticated')}</span>
                                        <span className="text-xs font-bold text-gray-500 leading-none">{user.name}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="px-6 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-xl border border-gray-200 transition-all active:scale-95 shadow-sm hover:shadow-md"
                                    >
                                        {t('navbar.signOut')}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <Link to="/login" className="text-gray-500 hover:text-gray-900 px-4 py-2 text-xs font-black uppercase tracking-widest transition-all">{t('navbar.logIn')}</Link>
                                    <Link to="/register" className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20">
                                        {t('navbar.joinNetwork')}
                                    </Link>
                                </div>
                            )}

                            {/* Language Selector */}
                            <div className="relative ml-4">
                                <select
                                    onChange={changeLanguage}
                                    value={i18n.language}
                                    className="appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-xl px-5 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer hover:bg-gray-100 shadow-sm"
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
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

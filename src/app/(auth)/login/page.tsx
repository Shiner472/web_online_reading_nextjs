'use client';
import InputField from "components/inputField/inputField";
import LayoutLoginRegister from "../layout";
import { useState } from "react";
import AuthAPI from "api/authAPI";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import Cookies from "js-cookie";
import { useLoading } from "context/loadingContext";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "lib/store";
import { loginRedux } from "lib/features/auth/authSlice";

const LoginPage = () => {
    const [identify, setIdentify] = useState('');
    const [password, setPassword] = useState('');
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailForPasskey, setEmailForPasskey] = useState('');
    const { showLoading, hideLoading } = useLoading();
    const t = useTranslations('LoginPage');
    const router = useRouter();

    const dispatch = useDispatch<AppDispatch>();
    const {login, register} = useSelector( (state: RootState)=>({
        login: state.auth.dataLogin,
        register: state.auth.dataRegister
    }));

    // ===== Đăng nhập truyền thống =====
    const submitLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identify || !password) {
            toast.error(t('fillAllFields'));
            return;
        }

        showLoading();
        try {
            dispatch(loginRedux({ identify, password }))
            // const response = await AuthAPI.login({ identify, password });
            // const token = response.data.token;
            // localStorage.setItem('token', token);
            // Cookies.set('token', token, { expires: 7 });
            router.push('/');
        } catch (error: any) {
            if (error.response?.status === 401) toast.error(t('invalidCredentials'));
            else toast.error(t('loginFailed'));
        } finally {
            hideLoading();
        }
    };

    // ===== Mở modal Passkey =====
    const handleOpenPasskeyModal = () => {
        setEmailForPasskey('');
        setShowEmailModal(true);
    };

    // ===== Đăng nhập bằng Passkey =====
    const handleLoginWithPasskey = async () => {
        if (!emailForPasskey) {
            toast.error("Please enter your email.");
            return;
        }

        showLoading();
        try {
            // 1️⃣ Lấy options
            const { data: options } = await AuthAPI.loginPasskeyOptions({ email: emailForPasskey });

            // 2️⃣ Gọi WebAuthn API
            const asseResp = await startAuthentication(options);

            // 3️⃣ Gửi verify
            const verifyRes = await AuthAPI.verifyPasskeyLogin({ email: emailForPasskey, response: asseResp });

            const token = verifyRes.data.token;
            localStorage.setItem('token', token);
            Cookies.set('token', token, { expires: 7 });

            setShowEmailModal(false);
            router.push('/');
        } catch (err: any) {
            toast.error("Passkey login failed");
        } finally {
            hideLoading();
        }
    };

    // ===== Đăng ký Passkey mới =====
    const handleRegisterPasskey = async () => {
        if (!emailForPasskey) {
            toast.error("Please enter your email.");
            return;
        }

        showLoading();
        try {
            const { data: options } = await AuthAPI.registerPasskeyOptions({ email: emailForPasskey });
            const attResp = await startRegistration(options);
            await AuthAPI.verifyPasskeyRegistration({ email: emailForPasskey, response: attResp });

            toast.success("Passkey registered successfully! You can now log in.");
            setShowEmailModal(false);
        } catch (err) {
            toast.error("Passkey registration failed");
        } finally {
            hideLoading();
        }
    };

    return (
        <LayoutLoginRegister>
            <div className='login-form bg-white p-8 rounded shadow-md w-100 max-w-md'>
                <h2 className='text-2xl font-bold mb-6 text-center'>{t('title')}</h2>
                <form>
                    <div className="mb-8">
                        <InputField
                            id="email"
                            type="text"
                            label={t('email')}
                            value={identify}
                            onChange={e => setIdentify(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-8">
                        <InputField
                            id="password"
                            type='password'
                            label={t('password')}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="text-sm text-right mb-2">
                        <a href='/forgotPassword' className='!text-blue-500 hover:underline'>{t('forgotPassword')}</a>
                    </div>

                    <button
                        onClick={submitLogin}
                        className='w-full bg-blue-500 !text-white py-2 rounded hover:bg-blue-600 transition-all duration-300 mb-3'
                    >
                        {t('submit')}
                    </button>

                    <button
                        type="button"
                        className='w-full bg-gray-100 text-black py-2 rounded hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2'
                        onClick={handleOpenPasskeyModal}
                    >
                        🔐 {t('loginWithPasskey') || 'Login / Register with Passkey'}
                    </button>
                </form>

                <p className='mt-4 text-sm text-center'>
                    {t('noAccount')} <a href='/register' className='!text-blue-500 hover:underline'>{t('register')}</a>
                </p>
            </div>

            {/* ===== MODAL ĐĂNG NHẬP / ĐĂNG KÝ PASSKEY ===== */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-sm relative">
                        <h3 className="text-lg font-semibold mb-4 text-center">🔑 {t('passkeyAuthentication')}</h3>
                        <InputField
                            id="emailModal"
                            type="email"
                            label="Email"
                            value={emailForPasskey}
                            onChange={(e) => setEmailForPasskey(e.target.value)}
                            required
                        />

                        <div className="flex flex-col gap-3 mt-6">
                            <button
                                onClick={handleLoginWithPasskey}
                                className="px-4 py-2 bg-blue-500 !text-white rounded hover:bg-blue-600"
                            >
                                {t('loginWithPasskey') || 'Login with Passkey'}
                            </button>

                            <button
                                onClick={handleRegisterPasskey}
                                className="px-4 py-2 bg-green-500 !text-white rounded hover:bg-green-600"
                            >
                                {t('registerWithPasskey') || 'Register with Passkey'}
                            </button>

                            <button
                                onClick={() => setShowEmailModal(false)}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                {t('cancel') || 'Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </LayoutLoginRegister>
    );
};

export default LoginPage;

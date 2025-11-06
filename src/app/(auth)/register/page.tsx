'use client';
import InputField from "components/inputField/inputField";
import LayoutLoginRegister from "../layout";
import { useState } from "react";
import AuthAPI from "api/authAPI";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { useLoading } from "context/loadingContext";
import { startRegistration } from "@simplewebauthn/browser";

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPasskeyModal, setShowPasskeyModal] = useState(false);
    const [passkeyEmail, setPasskeyEmail] = useState('');
    const t = useTranslations('RegisterPage');
    const router = useRouter();
    const { showLoading, hideLoading } = useLoading();

    // ===== Đăng ký truyền thống =====
    const submitRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = { userName: username, email, password };

        showLoading();
        try {
            await AuthAPI.register(data);
            localStorage.setItem('gmail', email);
            router.push('/verify?from=register');
        } catch {
            toast.error("Registration failed. Please try again.");
        } finally {
            hideLoading();
        }
    };

    // ===== Đăng ký bằng Passkey =====
    // const handleRegisterWithPasskey = async () => {
    //     if (!passkeyEmail) {
    //         toast.error("Please enter your email.");
    //         return;
    //     }

    //     setShowPasskeyModal(false);
    //     showLoading();
    //     try {
    //         // 1️⃣ Gọi API lấy options
    //         const { data: options } = await AuthAPI.registerPasskeyOptions({ email: passkeyEmail });

    //         // 2️⃣ Gọi WebAuthn API
    //         const attResp = await startRegistration(options);

    //         // 3️⃣ Gửi verify
    //         await AuthAPI.verifyPasskeyRegistration({ email: passkeyEmail, response: attResp });

    //         toast.success("Passkey registered successfully!");
    //         router.push('/login');
    //     } catch (err: any) {
    //         console.error(err);
    //         toast.error("Passkey registration failed");
    //     } finally {
    //         hideLoading();
    //     }
    // };

    return (
        <LayoutLoginRegister>
            <div className='register-form bg-white p-8 rounded shadow-md w-100 max-w-md'>
                <h2 className='text-2xl font-bold mb-6 text-center'>{t('title')}</h2>
                <form>
                    <div className="mb-8">
                        <InputField id="username" type="text" label={t('username')} required value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div className="mb-8">
                        <InputField id="email" type="email" label={t('email')} required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="mb-8">
                        <InputField id="password" type='password' label={t('password')} required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    <button
                        className='w-full bg-blue-500 !text-white py-2 rounded hover:bg-blue-600 transition-all duration-300 mb-3'
                        onClick={submitRegister}
                    >
                        {t('submit')}
                    </button>

                    {/* <button
                        type="button"
                        className='w-full bg-gray-100 text-black py-2 rounded hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-2'
                        onClick={() => setShowPasskeyModal(true)}
                    >
                        🔑 {t('registerWithPasskey') || 'Register with Passkey'}
                    </button> */}
                </form>

                <p className='mt-4 text-sm text-center'>
                    {t('haveAccount')} <a href='/login' className='!text-blue-500 hover:underline'>{t('login')}</a>
                </p>
            </div>

            {/* ===== Modal nhập email cho Passkey ===== */}
            {/* {showPasskeyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96 shadow-lg relative">
                        <h3 className="text-lg font-semibold mb-4">🔑 Register with Passkey</h3>

                        <InputField
                            id="passkeyEmail"
                            type="email"
                            label="Email"
                            value={passkeyEmail}
                            onChange={(e) => setPasskeyEmail(e.target.value)}
                            required
                        />

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                onClick={() => setShowPasskeyModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                onClick={handleRegisterWithPasskey}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )} */}
        </LayoutLoginRegister>
    );
};

export default RegisterPage;

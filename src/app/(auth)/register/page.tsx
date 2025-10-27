'use client';
import InputField from "components/inputField/inputField";
import LayoutLoginRegister from "../layout"
import { useState } from "react";
import AuthAPI from "api/authAPI";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslations } from 'next-intl';
import { useLoading } from "context/loadingContext";


const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const t = useTranslations('RegisterPage');
    const router = useRouter();
    const { showLoading, hideLoading } = useLoading();


    const submitRegister = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            'userName': username, 'email': email, 'password': password
        };
        showLoading();
        try {
            AuthAPI.register(data)
                .then(response => {
                    localStorage.setItem('gmail', email);
                    router.push('/verify?from=register');
                })
                .catch(error => {
                    // Handle registration error
                    toast.error("Registration failed. Please try again.");
                });
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            hideLoading();
        }

    };

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
                        className='w-full bg-blue-500 !text-white py-2 rounded hover:bg-blue-600 transition-all duration-300'
                        onClick={submitRegister}
                    >
                        {t('submit')}
                    </button>
                </form>
                <p className='mt-4 text-sm text-center'>
                    {t('haveAccount')} <a href='/login' className='!text-blue-500 hover:underline'>{t('login')}</a>
                </p>
            </div>
        </LayoutLoginRegister>
    );
};

export default RegisterPage;
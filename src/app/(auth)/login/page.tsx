'use client';
import InputField from "components/inputField/inputField";
import LayoutLoginRegister from "../layout"
import { useState } from "react";
import AuthAPI from "api/authAPI";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslations } from 'next-intl';
import Cookies from "js-cookie";
import { useLoading } from "context/loadingContext";


const LoginPage = () => {
    const [identify, setIdentify] = useState('');
    const [password, setPassword] = useState('');
    const { showLoading, hideLoading } = useLoading();
    const t = useTranslations('LoginPage');
    const router = useRouter();


    const submitLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = { identify, password };
        if (!identify || !password) {
            toast.error(t('fillAllFields'));
            return;
        }


        showLoading();
        try {
            const response = await AuthAPI.login({ identify, password });
            localStorage.setItem('token', response.data.token);
            Cookies.set("token", response.data.token, { expires: 7 });
            router.push('/');
        } catch (error: any) {
            if (error.response) {
                // Server trả về response nhưng có status lỗi
                switch (error.response.status) {
                    case 400:
                        toast.error(t('badRequest')); // dữ liệu gửi lên sai định dạng
                        break;
                    case 401:
                        toast.error(t('invalidCredentials')); // sai email/mật khẩu
                        break;
                    case 403:
                        toast.error(t('accountLocked')); // tài khoản bị khóa / không đủ quyền
                        break;
                    case 404:
                        toast.error(t('userNotFound')); // user không tồn tại
                        break;
                    case 500:
                        toast.error(t('serverError')); // lỗi server
                        break;
                    default:
                        toast.error(error.response.data?.message || t('loginFailed'));
                }
            } else if (error.request) {
                // Request gửi đi nhưng không nhận response (mất mạng / timeout)
                toast.error(t('networkError'));
            } else {
                toast.error(error.message || t('unexpectedError'));
            }
        } finally {
            hideLoading();
        }
    };


    return (
        <LayoutLoginRegister>
            <div className='login-form bg-white p-8 rounded shadow-md w-100 max-w-md' >
                <h2 className='text-2xl font-bold mb-6 text-center'>{t('title')}</h2>
                <form>
                    <div className="mb-8">
                        <InputField id="email" type="text" label={t('email')} value={identify} onChange={e => setIdentify(e.target.value)} required />
                    </div>
                    <div className="mb-8">
                        <InputField id="password" type='password' label={t('password')} value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>

                    <div className="text-sm text-right mb-2">
                        <a href='/forgotPassword' className='!text-blue-500 hover:underline'>{t('forgotPassword')}</a>
                    </div>

                    <button
                        onClick={submitLogin}
                        className='w-full bg-blue-500 !text-white py-2 rounded hover:bg-blue-600 transition-all duration-300'
                    >
                        {t('submit')}
                    </button>
                </form>



                <p className='mt-4 text-sm text-center'>
                    {t('noAccount')} <a href='/register' className='!text-blue-500 hover:underline'>{t('register')}</a>
                </p>
            </div>
        </LayoutLoginRegister >
    );
};

export default LoginPage;

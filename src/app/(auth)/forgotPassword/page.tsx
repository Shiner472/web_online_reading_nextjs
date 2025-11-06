'use client'
import InputField from "components/inputField/inputField"
import LayoutLoginRegister from "../layout"
import { useState } from "react";
import AuthAPI from "api/authAPI";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";



const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const router = useRouter();
    const t = useTranslations('ForgotPasswordPage');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error(t('fillAllFields'));
            return;
        }

        AuthAPI.resendVerificationCode({ email })
            .then(response => {
                localStorage.setItem('gmail', email);
                router.push('/verify?from=forgot-password');
            })
            .catch(error => {
                console.error("Error sending verification code:", error);
            });
    };

    return (
        <LayoutLoginRegister>
            <div className='forgot-password-form bg-white p-8 rounded shadow-md w-100 max-w-md'>
                <h2 className='text-2xl font-bold mb-6 text-center'>{t('title')}</h2>
                <p className='text-gray-600 mb-4 text-center'>{t('description')}</p>
                <form>
                    <div className="mb-8">
                        <InputField id="email" type="email" label="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <button
                        onClick={handleSubmit}
                        className='w-full bg-blue-500 !text-white py-2 rounded hover:bg-blue-600 transition-all duration-300 mt-4'

                    >
                        {t('buttonText')}
                    </button>
                </form>
                <p className='mt-4 text-sm text-center'>
                    {t('haveAccount')} <a href='/login' className='!text-blue-500 hover:underline'>{t('linkLogin')}</a>
                </p>
            </div>

        </LayoutLoginRegister>
    )
};

export default ForgotPasswordPage;
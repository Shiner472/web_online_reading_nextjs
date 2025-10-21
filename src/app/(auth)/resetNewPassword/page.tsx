'use client';
import { useState } from "react";
import LayoutLoginRegister from "../layout";
import InputField from "components/inputField/inputField";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import AuthAPI from "api/authAPI";
import { useRouter } from "next/navigation";



const ResetNewPasswordPage = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const t = useTranslations('ResetNewPasswordPage');
    const router = useRouter();
    const email = localStorage.getItem('gmail') || '';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            toast.error(t('fillAllFields'));
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error(t('passwordMismatch'));
            return;
        }
        const data = {
            email,
            newPassword
        };
        AuthAPI.resetPassword(data)
            .then(response => {
                router.push('/login');
            })
            .catch(error => {
                // Handle error
            });
    };

    return (
        <LayoutLoginRegister>
            <div className='reset-password-form bg-white p-8 rounded shadow-md w-100 max-w-md'>
                <h2 className='text-2xl font-bold mb-6 text-center'>{t('title')}</h2>
                <p className='text-gray-600 mb-4 text-center'>{t('description')}</p>
                <form>
                    <div className="mb-8">
                        <InputField id="new-password" type='password' label={t('newPassword')} required value={newPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)} />
                    </div>
                    <div className="mb-8">
                        <InputField id="confirm-password" type='password' label={t('confirmPassword')} required value={confirmPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)} />
                    </div>
                    <button
                        onClick={handleSubmit}
                        className='w-full bg-blue-500 !text-white py-2 rounded hover:bg-blue-600 transition-all duration-300 mt-4'
                    >
                        {t('submit')}
                    </button>
                </form>
            </div>
        </LayoutLoginRegister>
    );
};

export default ResetNewPasswordPage;


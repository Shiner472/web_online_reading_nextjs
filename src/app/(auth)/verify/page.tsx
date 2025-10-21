'use client';
import { useRef, useState } from "react";
import LayoutLoginRegister from "../layout"
import AuthAPI from "api/authAPI";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";


const VerifyPage = () => {
    const t = useTranslations('VerifyPage');
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const gmail = localStorage.getItem('gmail') || '';
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams?.get('from') || '';

    const submitVerificationCode = () => {
        const code = inputRefs.current.map(input => input ? input.value : '').join('');
        const data = {
            'activeCode': code,
            'email': gmail
        }
        AuthAPI.confirmUser(data)
            .then(response => {
                // Handle successful verification
                if (from === 'register') {
                    router.push('/login');
                } else if (from === 'forgot-password') {
                    router.push('/resetNewPassword');
                }
            })
            .catch(error => {
                router.push('/error');
            });
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        if (/^[0-9]$/.test(value)) {
            if (index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        } else {
            e.target.value = '';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <LayoutLoginRegister>
            <div className="flex flex-col items-center justify-center h-screen">
                <div className="bg-white p-8 rounded shadow-md w-full text-center">
                    <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
                    <p className="text-gray-600 mb-6">
                        {t('description')}
                    </p>

                    <div className="flex gap-3 mb-6 flex justify-center">
                        {Array(6)
                            .fill(0)
                            .map((_, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    className="w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-xl"
                                    onChange={(e) => handleChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    ref={el => { inputRefs.current[index] = el; }}
                                />
                            ))}
                    </div>

                    <button className="bg-blue-500 hover:bg-blue-600 !text-white font-semibold py-2 px-4 rounded"
                        onClick={submitVerificationCode}>
                        {t('submit')}
                    </button>
                </div>

            </div>
        </LayoutLoginRegister>
    );
};

export default VerifyPage;
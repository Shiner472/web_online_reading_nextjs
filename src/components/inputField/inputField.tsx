import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import next from 'next';
import React from 'react';

interface InputFieldProps {
    type?: string;
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({
    type = 'text',
    id,
    label,
    value,
    onChange,
    required = false,
    placeholder = ' '
}) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div className='relative'>
            <input
                type={type === 'password' && showPassword ? 'text' : type}
                id={id}
                required={required}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className='peer w-full h-12 px-3 pb-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-transparent'
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        const form = input.form;
                        if (form) {
                            const index = Array.from(form.elements).indexOf(input);
                            const next = form.elements[index + 1] as HTMLElement | undefined;
                            if (next) next.focus();
                        }
                    }
                }}
            />
            <label
                htmlFor={id}
                className={`
        absolute left-2 bg-white px-1 transition-all duration-200 ease-in-out
        text-sm
        peer-placeholder-shown:top-3
        peer-placeholder-shown:text-base
        peer-placeholder-shown:text-gray-400
        peer-focus:top-[-12px]
        peer-focus:text-sm
        peer-focus:text-blue-500
        peer-[&:not(:placeholder-shown)]:top-[-12px]
        peer-[&:not(:placeholder-shown)]:text-sm
        peer-[&:not(:placeholder-shown)]:text-gray-500
        peer-focus:peer-[&:not(:placeholder-shown)]:text-blue-500
    `}
            >
                {label}
            </label>

            {type === 'password' && (
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
            )}
        </div>
    );
}

export default InputField;
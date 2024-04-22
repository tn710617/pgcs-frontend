import React, {useState} from 'react';
import {useUserRegister} from "../APIs/auth";
import {setUserToLocalStorage} from "../Helpers/authHanders";
import toast, {Toaster} from "react-hot-toast";

function SecretModal({isOpen, setIsOpen}) {
    const [secret, setSecret] = useState('');
    const userRegister = useUserRegister();

    const handleSubmit = (event) => {
        event.preventDefault();
        // call register API and get the user hash id
        userRegister.mutate({secret: secret}, {
            onSuccess: (data) => {
                setUserToLocalStorage(data.id);
                setIsOpen(false);
            },
            onError: (error) => {
                toast.error('密鑰錯誤');
            }
        });
    };

    if (!isOpen) return null;

    return (
        <>
            <Toaster/>
            <div
                className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
                <div className="relative p-5 bg-white rounded-lg shadow-lg max-w-md w-full">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">輸入密鑰</h3>
                        <input
                            type="text"
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="請輸入密鑰"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            提交
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default SecretModal;

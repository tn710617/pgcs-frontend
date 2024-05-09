import React, {useState} from 'react';
import {useEnterRoom} from "../APIs/messageRoom";
import {useGetUserSelf} from "../APIs/auth";
import {isUserSet} from "../Helpers/authHanders";
import {useQueryClient} from "@tanstack/react-query";

function EnterRoomModal({isOpen}) {
    const [roomName, setRoomName] = useState('');
    const enterRoom = useEnterRoom();
    const queryClient = useQueryClient()
    const userSelf = useGetUserSelf({enabled: isUserSet()})


    const handleSubmit = (event) => {
        event.preventDefault();
        // call createOrEnterRoom API and get room id
        enterRoom.mutate({room_name: roomName}, {
            onSuccess: (data) => {
                // if success, close the modal
                queryClient.invalidateQueries(userSelf.queryKey);
            },
        });
    };

    return (
        isOpen &&
        <div
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
            <div className="relative p-5 bg-white rounded-lg shadow-lg max-w-md w-full">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">輸入房號</h3>
                    <input
                        type="text"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="請輸入房號"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        進入
                    </button>
                </form>
            </div>
        </div>
    );
}

export default EnterRoomModal;

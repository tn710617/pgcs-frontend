import './App.css';
import {useEffect, useState} from "react";
import {
    appendCoordinateToCopiedCoordinates, getUserHashId,
    isCoordinateCopied,
} from "./Messages/handlers";
import SecretModal from "./Messages/EnterSecretModal";
import EnterRoomModal from "./Messages/EnterRoomModal";
import {useRecoilState} from "recoil";
import {useGetUserSelf} from "./APIs/auth";
import {isUserSet} from "./Helpers/authHanders";
import enterSecretModalAtom from "./States/EnterSecretModalAtom";
import enterMessageRoomModalAtom from "./States/EnterMessageRoomModalAtom";
import {useCreateMessage, useIndexMessage} from "./APIs/message";
import {useQueryClient} from "@tanstack/react-query";
import {useLeaveRoom} from "./APIs/messageRoom";

function App() {
    const [inputValue, setInputValue] = useState('');
    const [, setCoordinatesCopiedCount] = useState(0);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [userId, setUserId] = useState(getUserHashId());

    const [isSecretModalOpen, setIsSecretModalOpen] = useRecoilState(enterSecretModalAtom);
    const [isEnterRoomModalOpen, setIsEnterRoomModalOpen] = useRecoilState(enterMessageRoomModalAtom);

    const userSelf = useGetUserSelf({enabled: isUserSet()})
    const createMessage = useCreateMessage();
    const indexMessage = useIndexMessage({enabled: (currentRoomId !== null) && (currentRoomId !== undefined)});
    const leaveRoom = useLeaveRoom()

    const queryClient = useQueryClient();

    useEffect(() => {
        if (userSelf.isSuccess && userSelf.data) {
            setUserId(userSelf.data.id)
        }
    }, [userSelf]);

    useEffect(() => {
        const maintainCurrentRoomId = async () => {
            if (userSelf.isSuccess && userSelf.data) {
                const currentRoomId = userSelf.data.current_room?.id;
                if (currentRoomId !== null) {
                    setCurrentRoomId(currentRoomId)
                }
                if (currentRoomId === null || currentRoomId === undefined) {
                    setCurrentRoomId(() => null)
                }
            }
        }

        maintainCurrentRoomId()
    }, [userSelf]);

    useEffect(() => {
        const listenToChannel = async () => {
            if (currentRoomId !== null && currentRoomId !== undefined) {
                window.Echo.private(`messageRooms.${currentRoomId}`)
                    .listen('MessageCreated', (e) => {
                        queryClient.invalidateQueries(indexMessage.queryKey);
                    });
            }
        }

        listenToChannel();

        return () => {
            if (currentRoomId !== null) {
                window.Echo.leave(`messageRooms.${currentRoomId}`)
            }
        }
    }, [currentRoomId, indexMessage.queryKey, queryClient]);

    useEffect(() => {
        const maintainEnterRoomModal = () => {
            if (currentRoomId === null && userId !== null) {
                setIsEnterRoomModalOpen(true)
            }
            if (currentRoomId !== null) {
                setIsEnterRoomModalOpen(false)
            }
        }

        maintainEnterRoomModal()
    }, [currentRoomId, setIsEnterRoomModalOpen, userId]);

    const handlePaste = async (event) => {
        event.preventDefault();
        const text = await navigator.clipboard.readText();
        await setInputValue(text);
    };

    const handleCoordinateClicked = (coordinate) => {
        appendCoordinateToCopiedCoordinates(coordinate);
        navigator.clipboard.writeText(coordinate)
        setCoordinatesCopiedCount(prev => prev + 1)
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        createMessage.mutate({message_content: inputValue}, {
            onSuccess: () => {
                setInputValue(() => '')
                queryClient.invalidateQueries(indexMessage.queryKey);
            },
            onError: (error) => {
                console.error(error)
            }
        });
    }

    const handleLeave = () => {
        leaveRoom.mutate({}, {
            onSuccess: () => {
                window.location.reload()
            },
            onError: (error) => {
                console.error(error)
            }
        });
    }


    return (
        <>
            <SecretModal isOpen={isSecretModalOpen} setIsOpen={(isOpen) => setIsSecretModalOpen(isOpen)}/>
            <EnterRoomModal isOpen={isEnterRoomModalOpen} setIsOpen={(isOpen) => setIsEnterRoomModalOpen(isOpen)}/>

            <div className="h-screen overflow-hidden">
                <div className="h-screen flex flex-col justify-end overflow-y-auto p-4 pb-36">
                    {
                        indexMessage.isSuccess && indexMessage.data.map((message, index) => (
                            <div key={message.id} className="flex mb-4 cursor-pointer"
                                 onClick={() => handleCoordinateClicked(message.message_content)}>
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center mr-2 ${isCoordinateCopied(message.message_content) ? 'bg-blue-500' : 'bg-pink-500'}`}>
                                </div>
                                <div className="flex max-w-96 bg-white rounded-lg p-3 gap-3">
                                    <p className="text-gray-700">{message.message_content}</p>
                                </div>
                            </div>
                        ))

                    }
                </div>

                <footer className="bg-white border-t border-gray-300 p-4 absolute bottom-0 w-full">
                    <form className="space-y-6">
                        <div className="flex justify-end">
                            <button className="bg-red-500 text-white px-4 py-2 rounded-md ml-2 w-36"
                                    type={"button"}
                                    onClick={handleLeave}
                            >離開房間
                            </button>
                        </div>
                        <div className="flex items-center">
                            <input type="text" placeholder="Type a message..."
                                   className="w-full p-2 rounded-md border border-gray-400 focus:outline-none focus:border-blue-500"
                                   value={inputValue} onChange={(event) => setInputValue(event.target.value)}
                                pattern={"^-?\\d+\\.\\d+\\s*,\\s*-?\\d+\\.\\d+$"}
                            />
                            <button className="bg-indigo-500 w-24 text-white px-4 py-2 rounded-md ml-2"
                                    onClick={handlePaste}>貼上
                            </button>

                            <button className="bg-indigo-500 text-white px-4 py-2 rounded-md ml-2 w-24"
                                    type={"button"}
                                    onClick={handleSubmit}
                            >發送
                            </button>
                        </div>
                    </form>
                </footer>
            </div>
        </>
    );
}

export default App;

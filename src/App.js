import './App.css';
import {useEffect, useRef, useState} from "react";
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
import {useCreateMessage, useDeleteMessage, useIndexMessage} from "./APIs/message";
import {useQueryClient} from "@tanstack/react-query";
import {useLeaveRoom} from "./APIs/messageRoom";
import toast, {Toaster} from "react-hot-toast";

function App() {
    const [inputValue, setInputValue] = useState('');
    const [, setCoordinatesCopiedCount] = useState(0);
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [userId, setUserId] = useState(getUserHashId());

    const [isSecretModalOpen, setIsSecretModalOpen] = useRecoilState(enterSecretModalAtom);
    const [isEnterRoomModalOpen, setIsEnterRoomModalOpen] = useRecoilState(enterMessageRoomModalAtom);

    const userSelf = useGetUserSelf({enabled: isUserSet()})
    const createMessage = useCreateMessage();
    const deleteMessage = useDeleteMessage();
    const indexMessage = useIndexMessage({enabled: (currentRoomId !== null) && (currentRoomId !== undefined)});
    const leaveRoom = useLeaveRoom()

    const queryClient = useQueryClient();
    const coordinateInputRef = useRef(null);

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
                    })
                    .listen('MessageDeleted', (e) => {
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
        toast.success('已複製');
    }

    const handleDeleteCoordinate = (event) => {
        const messageId = event.target.id;

        deleteMessage.mutate({messageId: messageId}, {
            onSuccess: () => {
                queryClient.invalidateQueries(indexMessage.queryKey);
                toast('已刪除', {icon: '🗑️'})
            },
            onError: (error) => {
                console.error(error)
            }
        });
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if (inputValue === '') {
            return
        }
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

    useEffect(() => {
        const handleKeyDown = async (event) => {
            if (event.key === 'Enter' && document.activeElement !== coordinateInputRef.current) {
                event.preventDefault();
                if (inputValue !== '') {
                    await handleSubmit(event)
                    return
                }

                if (inputValue === '') {
                    await handleSendCopy(event)
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, [inputValue]);

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

    const handleSendCopy = async (event) => {
        // send the first coordinate from clipboard
        event.preventDefault();

        const text = await navigator.clipboard.readText();
        if (text === '') {
            return
        }

        createMessage.mutate({message_content: text}, {
            onSuccess: () => {
                queryClient.invalidateQueries(indexMessage.queryKey);
            },
            onError: (error) => {
                console.error(error)
            }
        });
    }

    return (
        <>
            <Toaster/>
            {
                userSelf.isSuccess &&
                <EnterRoomModal isOpen={isEnterRoomModalOpen} setIsOpen={(isOpen) => setIsEnterRoomModalOpen(isOpen)}/>
            }
            <SecretModal isOpen={isSecretModalOpen} setIsOpen={(isOpen) => setIsSecretModalOpen(isOpen)}/>

            <div className={"flex flex-col justify-end h-screen"}>
                <div className="justify-end overflow-y-auto p-4">
                    {
                        indexMessage.isSuccess && indexMessage.data.map((message, index) => (
                            <div key={message.id} className="flex mb-4">
                                <div
                                    className={`min-w-9 min-h-9 w-9 h-9 rounded-full items-center mr-2 ${isCoordinateCopied(message.message_content) ? 'bg-gray-400' : 'bg-black'}`}
                                >
                                </div>
                                {
                                    message.user_id === userId &&
                                    <div
                                        id={message.id}
                                        className={`min-w-9 min-h-9 w-9 h-9 rounded-lg mr-2 bg-red-500 cursor-pointer text-white text-xs flex justify-center items-center font-bold`}
                                        onClick={handleDeleteCoordinate}
                                    >
                                        DEL
                                    </div>
                                }
                                <div className="bg-white w-auto max-w-full rounded-lg cursor-pointer"
                                     onClick={() => handleCoordinateClicked(message.message_content)}>
                                    <p className="text-gray-700 w-auto break-words">{message.message_content}</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
                <footer className="bg-white border-t border-gray-300 p-4 bottom-0 w-full">
                    <div className="flex flex-wrap items-center gap-3">
                        <div>
                            <form className="flex" onSubmit={handleSubmit}>
                                <input type="text" placeholder="輸入座標" ref={coordinateInputRef}
                                       className="w-72 p-2 rounded-md border border-gray-400 focus:outline-none focus:border-blue-500 hidden sm:block"
                                       value={inputValue} onChange={(event) => setInputValue(event.target.value)}
                                    // pattern={"^-?\\d+\\.\\d+\\s*,\\s*-?\\d+\\.\\d+$"}
                                />

                                <button className="bg-indigo-500 text-white px-4 py-2 rounded-md ml-2 w-24 hidden sm:block"
                                        type={"submit"}
                                >發送
                                </button>
                            </form>
                        </div>
                        <div className={"flex gap-3"}>
                            <button className="bg-indigo-500 w-20 text-white px-4 py-2 rounded-md hidden sm:block"
                                    onClick={handlePaste}>貼上
                            </button>
                            <button className="bg-indigo-500 w-24 text-white px-4 py-2 rounded-md"
                                    onClick={handleSendCopy}>發送複製
                            </button>
                            <button className="bg-red-500 w-20 text-white px-4 py-2 rounded-md"
                                    onClick={handleLeave}>離開
                            </button>
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}

export default App;

import {useMutation} from "@tanstack/react-query";
import useAxios from "./useAxios";
import {getUserFromLocalStorage} from "../Helpers/authHanders";

export function useEnterRoom(options = {}) {
    const axios = useAxios()
    return useMutation({
        mutationFn: async (data = {}) => {
            const userId = getUserFromLocalStorage()
            const res = await axios.post(`message-rooms/create-or-enter`, data, {
                headers: {
                    Authorization: `Bearer ${userId}`
                }
            })
            return res.data.data
        }, ...options
    })
}

export function useLeaveRoom(options = {}) {
    const axios = useAxios()
    return useMutation({
        mutationFn: async () => {
            const userId = getUserFromLocalStorage()
            const res = await axios.post(`message-rooms/leave`, {}, {
                headers: {
                    Authorization: `Bearer ${userId}`
                }
            })
            return res.data.data
        }, ...options
    })
}
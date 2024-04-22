import {useMutation} from "@tanstack/react-query";
import useAxios from "./useAxios";
import {getUserFromLocalStorage} from "../Helpers/authHanders";

export function useEnterRoom(options = {}) {
    const axios = useAxios()
    return useMutation({
        mutationFn: async (data = {}) => {
            data.user_id = getUserFromLocalStorage()
            const res = await axios.post(`message-rooms/create-or-enter`, data, {
                headers: {
                    Authorization: `Bearer ${data.user_id}`
                }
            })
            return res.data.data
        }, ...options
    })
}

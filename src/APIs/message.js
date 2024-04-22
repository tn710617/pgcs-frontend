import {useMutation, useQuery} from "@tanstack/react-query";
import useAxios from "./useAxios";
import {getUserFromLocalStorage} from "../Helpers/authHanders";
import queryString from "query-string";

export function useIndexMessage(options = {}) {
    const axios = useAxios()
    const userId = getUserFromLocalStorage()
    return useQuery({
        queryKey: ['messages', userId],
        queryFn: async () => {
            const queryObject = {
                user_id: userId
            }
            const query = queryString.stringify(queryObject, {arrayFormat: 'bracket'})
            const res = await axios.get(`messages?${query}`, {
                headers: {
                    Authorization: `Bearer ${userId}`
                }
            })
            return res.data.data
        }, ...options
    })
}


export function useCreateMessage(options = {}) {
    const axios = useAxios()
    return useMutation({
        mutationFn: async (data = {}) => {
            data.user_id = getUserFromLocalStorage()
            const res = await axios.post(`messages`, data, {
                headers: {
                    Authorization: `Bearer ${data.user_id}`,
                    "X-Socket-Id": window.Echo.socketId()
                }
            })
            return res.data.data
        }, ...options
    })
}

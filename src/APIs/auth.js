import {useMutation, useQuery} from "@tanstack/react-query";
import {getUserFromLocalStorage} from "../Helpers/authHanders";
import queryString from "query-string";
import useAxios from "./useAxios";

export function useGetUserSelf(options = {}) {
    const axios = useAxios()
    const userId = getUserFromLocalStorage()
    return useQuery({
        queryKey: ['users', userId],
        queryFn: async () => {
            const queryObject = {
                user_id: userId
            }
            const query = queryString.stringify(queryObject, {arrayFormat: 'bracket'})
            const res = await axios.get(`users/self?${query}`, {
                headers: {
                    Authorization: `Bearer ${userId}`
                }
            })
            return res.data.data
        }, ...options
    })
}

export function useUserRegister(options = {}) {
    const axios = useAxios()
    return useMutation({
        mutationFn: async (data = {}) => {
            const res = await axios.post(`users/register`, data)
            return res.data.data
        }, ...options
    })
}

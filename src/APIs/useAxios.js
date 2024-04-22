import getAxios from "./axios";
import {useEffect} from "react";
import {useRecoilState} from "recoil";
import {useNavigate} from "react-router-dom";
import enterSecretModalAtom from "../States/EnterSecretModalAtom";
import {clearUser} from "../Helpers/authHanders";
import {getUserHashId} from "../Messages/handlers";

const userHashId = getUserHashId()
const normalAxios = getAxios({Authorization: `Bearer ${userHashId}`})
const axiosPrecognitive = getAxios({
    "precognitive": "true"
})

const useAxios = (isPrecognitive = false) => {

    const axios = isPrecognitive ? axiosPrecognitive : normalAxios;
    const navigate = useNavigate()
    const [, setIsEnterSecretModalOpen] = useRecoilState(enterSecretModalAtom)

    useEffect(() => {
        const responseIntercept = axios.interceptors.response.use(response => response,
            async (error) => {
                if (error?.response?.status === 401) {
                    clearUser()
                    setIsEnterSecretModalOpen(true)
                }

                if (error?.response?.status === 403) {
                    navigate('/')
                }
                return Promise.reject(error)
            }
        );

        return () => {
            axios.interceptors.response.eject(responseIntercept);
        }
    }, [axios, setIsEnterSecretModalOpen, navigate])

    return axios;
}

export default useAxios;
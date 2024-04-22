import axios from "axios";

export default function getAxios(headers = {}) {
    const baseUrl = process.env.REACT_APP_API_URL

    const commonConfig = {
        baseURL: baseUrl,
        headers: {'Content-Type': 'application/json', ...headers},
        withCredentials: true
    }

    return axios.create({...commonConfig});
}
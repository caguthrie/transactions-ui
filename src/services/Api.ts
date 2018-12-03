import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL as string;

export const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    params: {}
});

api.interceptors.request.use((config) => {
    return {
        ...config,
        headers: {
            ...config.headers,
            authorization: `Bearer ${localStorage.getItem("auth")}`
        }
    };
});

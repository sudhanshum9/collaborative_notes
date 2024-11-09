import axiosCall from './axios';

export const login = async (credentials) => {
    console.log({credentials})
    return await axiosCall.post('/token/', credentials);
};

export const register = async (data) => {
    console.log({data})
    return await axiosCall.post('/register/', data);
};

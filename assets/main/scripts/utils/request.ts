import axios, { Method } from 'axios';

const instance = axios.create({});

export function request(
    url: string,
    method: Method = 'GET',
    data: any = {},
    headers: any = {},
) {
    return instance({
        url,
        headers,
        method,
        [['put', 'post', 'patch'].includes(String(method).toLowerCase())
            ? 'data'
            : 'params']: data || {},
    });
}

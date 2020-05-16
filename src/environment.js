export const ENV = 'local';

const apiURLs = {
    'local': 'http://localhost:3000',
    'test': '',
    'prod': ''
}

export const API_URL = apiURLs[ENV];
export const ENV = 'test';

const apiURLs = {
    'local': 'http://localhost:3000',
    'test': 'https://fastcoding.ap.ngrok.io',
    'prod': 'https://fastcoding.ap.ngrok.io'
}

export const API_URL = apiURLs[ENV];
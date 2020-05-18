export const ENV = 'local';

const apiURLs = {
    'local': 'http://localhost:3000',
    'test': 'https://a2b26906.eu.ngrok.io',
    'prod': ''
}

export const API_URL = apiURLs[ENV];
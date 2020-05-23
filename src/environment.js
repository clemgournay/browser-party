export const ENV = 'local';

const apiURLs = {
    'local': 'http://localhost:3000',
    'test': 'https://8c7e95c7ca89.eu.ngrok.io',
    'prod': ''
}

export const API_URL = apiURLs[ENV];
import {config} from 'dotenv'
config() // добавление переменных из файла .env в process.env

export const SETTINGS = {
    PORT: process.env.PORT || 3000,
    PATH: {
        VIDEOS: '/videos',
    },
}
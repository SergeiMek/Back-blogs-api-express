import {config} from 'dotenv'
config() // добавление переменных из файла .env в process.env

export const SETTINGS = {
    PORT: process.env.PORT || 3000,
    PATH: {
        VIDEOS: '/videos',
    },
}

export const HTTP_STATUSES ={
    OK_200: 200,
    CREATED_201:201,
    ACCEPTED_202:202,
    NON_AUTHORITATIVE_INFORMATION_203:203,
    NO_CONTEND_204:204,
    RESET_CONTENT:205,


    BAD_REQUEST_400:400,
    UNAUTHORIZED_401:401,
    PAYMENT_REQUIRED_402:402,
    FORBIDDEN_403:403,
    NOT_FOUNT_404:404,

}
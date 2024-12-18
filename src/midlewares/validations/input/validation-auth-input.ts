import {body, param} from "express-validator";
import {inputCheckErrorsMiddleware} from "../_validation-error-check";

import {BlogsQueryRepository} from "../../../repositories/blog-query-repository";
import {usersRepository} from "../../../repositories/users-repository";


const loginOrEmail = body("loginOrEmail")
    .exists()
    .withMessage("Login is required")
    .isString()
    .withMessage("Type of Login must be string")
    .trim()
    .isLength({
        min: 3,
        max: 50,
    })
    .withMessage(
        "Login length must be more than 3 and less than or equal to 50 symbols"
    )

const confirmCode = body("code")
    .exists()
    .withMessage("Code is required")
    .isString()
    .withMessage("Type of Code must be string")



const password = body("password").exists()
    .withMessage("Password is required")
    .isString()
    .withMessage("Type of Password must be string")
    .trim()
    .isLength({
        min: 6,
        max: 20
    })
    .withMessage("Password length must be more than 6 and less than or equal to 20 symbols")

const recoveryCode = body("recoveryCode").exists()
    .withMessage("recovery code is required")
    .isString()
    .withMessage("Type of recovery code must be string")


const newPassword = body("newPassword").exists()
    .withMessage("Password is required")
    .isString()
    .withMessage("Type of Password must be string")
    .trim()
    .isLength({
        min: 6,
        max: 20
    })
    .withMessage("Password length must be more than 6 and less than or equal to 20 symbols")


const email = body("email").exists()
    .withMessage("Email is required")
    .isString()
    .withMessage("Type of Email must be string")
    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .withMessage("Incorrect Email")



export const validationAuthInputPost = [loginOrEmail, password, inputCheckErrorsMiddleware]
export const validationConfirmCode = [confirmCode, inputCheckErrorsMiddleware]
export const validationEmail = [email, inputCheckErrorsMiddleware]
export  const validationRecoveryPassword = [recoveryCode,newPassword,inputCheckErrorsMiddleware]
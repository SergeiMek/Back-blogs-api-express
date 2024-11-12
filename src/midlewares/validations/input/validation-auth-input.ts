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
    .matches(/^[a-zA-Z0-9_-]*$/)
    .withMessage(
        "Login has invalid characters"
    )

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




export const validationAuthInputPost = [loginOrEmail, password, inputCheckErrorsMiddleware]
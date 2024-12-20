import {body, param} from "express-validator";
import {inputCheckErrorsMiddleware} from "../_validation-error-check";
import {UsersRepository} from "../../../repositories/users-repository";


const usersRepository = new UsersRepository()

const loginValidation = body("login")
    .exists()
    .withMessage("Login is required")
    .isString()
    .withMessage("Type of Login must be string")
    .trim()
    .isLength({
        min: 3,
        max: 10,
    })
    .withMessage(
        "Login length must be more than 3 and less than or equal to 10 symbols"
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

const email = body("email").exists()
    .withMessage("Email is required")
    .isString()
    .withMessage("Type of Email must be string")
    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .withMessage("Incorrect Email")
    .custom(
        async (email: string) => {
            const user = await usersRepository.findByLoginOrEmail(email);
            if (user) {
                throw new Error("email already exist");
            }
            return true;
        })


export const validationUsersInputPost = [loginValidation, password, email, inputCheckErrorsMiddleware]


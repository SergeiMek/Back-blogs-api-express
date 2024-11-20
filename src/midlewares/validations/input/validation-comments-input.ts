import {body, param} from "express-validator";
import {inputCheckErrorsMiddleware} from "../_validation-error-check";

import {BlogsQueryRepository} from "../../../repositories/blog-query-repository";
import {usersRepository} from "../../../repositories/users-repository";


const  content= body("content")
    .exists()
    .withMessage("Content is required")
    .isString()
    .withMessage("Type of Content must be string")
    .trim()
    .isLength({
        min: 20,
        max: 300,
    })
    .withMessage(
        "Content length must be more than 20 and less than or equal to 300 symbols"
    )





export const validationCommentsInputPost = [content, inputCheckErrorsMiddleware]
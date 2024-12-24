import {body} from "express-validator";
import {inputCheckErrorsMiddleware} from "../_validation-error-check";


const content = body("content")
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

const likeStatus = body("likeStatus")
        .exists()
        .withMessage("LikeStatus is required")
        .isString()
        .withMessage("Type of LikeStatus must be string")
        .trim()
        .isIn(["None", "Like", "Dislike"])
        .withMessage(`Like status should be None, Like or Dislike`)


    export
const validationCommentsInputPost = [content, inputCheckErrorsMiddleware]
export const validationUpdateLikeStatus = [likeStatus,inputCheckErrorsMiddleware]
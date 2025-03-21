import {body} from "express-validator";
import {inputCheckErrorsMiddleware} from "../_validation-error-check";
import {BlogQueryRepository} from "../../../repositories/blog-query-repository";


const blogsQueryRepository = new BlogQueryRepository()

export const validationPostsCreationCustom = body("blogId").isString().withMessage('not string')
    .trim().custom(async (value) => {
        const blog = await blogsQueryRepository.findBlogById(value);
        if (!blog) {
            throw new Error("Blog with provided ID not found");
        }
        return true;
    });


export const validationPosts = [
    body("title")
        .exists()
        .withMessage("Title is required")
        .isString()
        .withMessage("Type of title must be string")
        .trim()
        .isLength({
            min: 1,
            max: 30,
        })
        .withMessage(
            "Title length must be more than 0 and less than or equal to 30 symbols"
        ),
    body("shortDescription")
        .exists()
        .withMessage("Short description is required")
        .isString()
        .withMessage("Type of short description must be string")
        .trim()
        .isLength({
            min: 1,
            max: 100,
        })
        .withMessage(
            "Short description length must be more than 0 and less than or equal to 100 symbols"
        ),
    body("content")
        .exists()
        .withMessage("Content is required")
        .isString()
        .withMessage("Type of content must be string")
        .trim()
        .isLength({
            min: 1,
            max: 1000,
        })
        .withMessage(
            "Short description length must be more than 0 and less than or equal to 1000 symbols"
        ),
    body("content")
        .exists()
        .withMessage("Blog ID is required")
        .isString()
        .withMessage("Type of Blog ID must be string"),
    validationPostsCreationCustom,
    inputCheckErrorsMiddleware
];


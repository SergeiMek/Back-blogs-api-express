import {Request, Response, Router} from "express";
import {userInputType, usersEntityType, usersOutputType, usersQueryType} from "../types/usersType";
import {paginationUsersQueries} from "../helpers/paginations_values";
import {HTTP_STATUSES} from "../settings";
import {authBasic} from "../midlewares/auth/auth-basic";
import {validationUsersInputPost} from "../midlewares/validations/input/validation-users-input";
import {usersService} from "../domain/users-service";
import {usersQueryRepository} from "../repositories/users-query-repository";


export const usersRouter = Router({})

class UsersController {
    async getAllUsers(req: Request<{}, {}, {}, usersQueryType>, res: Response<usersOutputType>) {
        const {
            sortBy,
            sortDirection,
            pageNumber,
            pageSize,
            searchEmailTerm,
            searchLoginTerm
        } = paginationUsersQueries(req)
        res.status(HTTP_STATUSES.OK_200).json(await usersQueryRepository.getAllUsers({
            sortBy,
            sortDirection,
            pageNumber,
            pageSize,
            searchEmailTerm,
            searchLoginTerm
        }))
    }

    async createdUser(req: Request<{}, {}, userInputType, {}>, res: Response<usersEntityType | null>) {
        const {login, password, email} = req.body
        const createdUserId = await usersService.createdUser({login, password, email,})
        const createdUser = await usersQueryRepository.findUserById(createdUserId)

        res.status(HTTP_STATUSES.CREATED_201).json(createdUser)
    }

    async deleteUser(req: Request<{ id: string }>, res: Response<void>) {

        const isDeleted = await usersService.deleteUser(req.params.id)

        if (isDeleted) {
            res.sendStatus(HTTP_STATUSES.NO_CONTEND_204)
        } else {
            res.sendStatus(HTTP_STATUSES.NOT_FOUNT_404)
        }
    }
}

const userControllerInstance = new UsersController()


usersRouter.get('/', authBasic, userControllerInstance.getAllUsers)
usersRouter.post('/', authBasic, validationUsersInputPost, userControllerInstance.createdUser)
usersRouter.delete('/:id', authBasic, userControllerInstance.deleteUser)
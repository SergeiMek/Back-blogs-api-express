import "reflect-metadata";
import {UsersRepository} from "./repositories/users-repository";
import {UsersService} from "./domain/users-service";
import {UsersQueryRepository} from "./repositories/users-query-repository";
import {DevicesService} from "./domain/devices-service";
import {DevicesRepository} from "./repositories/devices-repository";
import {AuthQueryRepository} from "./repositories/auth-query-repository";
import {AuthService} from "./domain/auth-service";
import {BlogQueryRepository} from "./repositories/blog-query-repository";
import {PostsService} from "./domain/posts-service";
import {PostsRepository} from "./repositories/posts-repository";
import {BlogsRepository} from "./repositories/blogs-repository";
import {PostsQueryRepository} from "./repositories/posts-query-repository";
import {BlogsService} from "./domain/blogs-service";
import {CommentsQueryRepository} from "./repositories/comments-query-repository";
import {CommentsService} from "./domain/comments-service";
import {CommentsRepository} from "./repositories/comments-repository";
import {SecurityQueryRepository} from "./repositories/security-query-repository";
import {Container} from "inversify";
import {RateService} from "./domain/rate-servise";
import {RateRepository} from "./repositories/rate-repository";
import {BlogsController} from "./routes/blogs-router";
import {UsersController} from "./routes/users-router";
import {AuthController} from "./routes/auth-router";
import {CommentsController} from "./routes/comments-router";
import {SecurityController} from "./routes/security-router";
import {PostsController} from "./routes/posts-router";


export const container = new Container()

/*container.bind(UsersController).to(UsersController);
container.bind(AuthController).to(AuthController)
container.bind(BlogsController).to(BlogsController)
container.bind(CommentsController).to(CommentsController)
container.bind(PostsController).to(PostsController)
container.bind(SecurityController).to(SecurityController)*/



container.bind(AuthService).to(AuthService)
container.bind(BlogsService).to(BlogsService)
container.bind(CommentsService).to(CommentsService)
container.bind(DevicesService).to(DevicesService)
container.bind(PostsService).to(PostsService)
container.bind(RateService).to(RateService)
container.bind(UsersService).to(UsersService)



container.bind(BlogsRepository).to(BlogsRepository)
container.bind(CommentsRepository).to(CommentsRepository)
container.bind(DevicesRepository).to(DevicesRepository)
container.bind(PostsRepository).to(PostsRepository)
container.bind(RateRepository).to(RateRepository)
container.bind(UsersRepository).to(UsersRepository)



container.bind(AuthQueryRepository).to(AuthQueryRepository)
container.bind(BlogQueryRepository).to(BlogQueryRepository)
container.bind(CommentsQueryRepository).to(CommentsQueryRepository)
container.bind(PostsQueryRepository).to(PostsQueryRepository)
container.bind(SecurityQueryRepository).to(SecurityQueryRepository)
container.bind(UsersQueryRepository).to(UsersQueryRepository)


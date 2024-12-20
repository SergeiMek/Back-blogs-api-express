import {UsersRepository} from "./repositories/users-repository";
import {UsersService} from "./domain/users-service";
import {UsersQueryRepository} from "./repositories/users-query-repository";
import {UsersController} from "./routes/users-router";
import {AuthController} from "./routes/auth-router";
import {DevicesService} from "./domain/devices-service";
import {DevicesRepository} from "./repositories/devices-repository";
import {AuthQueryRepository} from "./repositories/auth-query-repository";
import {AuthService} from "./domain/auth-service";
import {BlogsController} from "./routes/blogs-router";
import {BlogQueryRepository} from "./repositories/blog-query-repository";
import {PostsService} from "./domain/posts-service";
import {PostsRepository} from "./repositories/posts-repository";
import {BlogsRepository} from "./repositories/blogs-repository";
import {PostsQueryRepository} from "./repositories/posts-query-repository";
import {BlogsService} from "./domain/blogs-service";
import {CommentsController} from "./routes/comments-router";
import {CommentsQueryRepository} from "./repositories/comments-query-repository";
import {CommentsService} from "./domain/comments-service";
import {CommentsRepository} from "./repositories/comments-repository";
import {PostsController} from "./routes/posts-router";
import {SecurityController} from "./routes/security-router";
import {SecurityQueryRepository} from "./repositories/security-query-repository";


export const usersRepository = new UsersRepository()
 export const usersQueryRepository = new UsersQueryRepository()
export const devicesRepository = new DevicesRepository
export const authQueryRepository = new AuthQueryRepository()
export const blogsQueryRepository = new BlogQueryRepository()
export const postsRepository = new PostsRepository()
export const blogsRepository = new BlogsRepository()
export const postsQueryRepository = new PostsQueryRepository()
export const commentsQueryRepository = new CommentsQueryRepository()
export const commentsRepository = new CommentsRepository()
export const securityQueryRepository = new SecurityQueryRepository()


 export const usersService = new UsersService(usersRepository)
export const devicesService = new DevicesService(devicesRepository)
export const authService = new AuthService(usersRepository)
export const postsService = new PostsService(postsRepository, blogsRepository)
export const blogsService = new BlogsService(blogsRepository)
export const commentsService = new CommentsService(usersRepository, postsRepository, commentsRepository)







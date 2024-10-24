import express from 'express'
import cors from 'cors'
import {SETTINGS} from "./settings";
import {videosRouter} from "./routes/videosRouter";
import {deleteDB} from "./db/db";
import {blogsRouter} from "./routes/blogs-router";
import {postsRouter} from "./routes/posts-router";

export const app = express()
app.use(express.json())
app.use(cors())

app.use(SETTINGS.PATH.VIDEOS, videosRouter)
app.use(SETTINGS.PATH.BLOGS, blogsRouter)
app.use(SETTINGS.PATH.POSTS, postsRouter)
app.delete('/testing/all-data', async (req, res) => {
    await deleteDB()
    res.sendStatus(204)
})

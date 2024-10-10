import express from 'express'
import cors from 'cors'
import {SETTINGS} from "./settings";
import {videosRouter} from "./routes/videosRouter";
import { setDB} from "./db/db";

export const app = express()
app.use(express.json())
app.use(cors())

app.use(SETTINGS.PATH.VIDEOS, videosRouter)
app.delete('/testing/all-data', (req, res) => {
    setDB()
    res.sendStatus(204)
})

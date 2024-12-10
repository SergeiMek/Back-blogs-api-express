import {app} from './app'
import {SETTINGS} from './settings'
import {dbMongo} from "./db/dbInMongo";



const startApp = async () => {
   /// const res = await runDb(SETTINGS.MONGO_URL)
    app.set('trust proxy', true)
    const res = await dbMongo.run(SETTINGS.MONGO_URL)
    if (!res) process.exit(1)


    app.listen(SETTINGS.PORT, () => {
        console.log('...server started in port ' + SETTINGS.PORT)
    })

}

startApp()
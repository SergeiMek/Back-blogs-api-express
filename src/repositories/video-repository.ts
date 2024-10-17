import {db} from "../db/db";
import {newVideoCreatedDataType, videosInputType} from "../types/videosType";


export const videoRepository = {
    getAllVideo() {

        return db.videos
    },
    findVideoById(id: number) {
        return db.videos.find(v => v.id === id)
    },
    createdVideo(newVideoCreatedData: newVideoCreatedDataType) {
        let today = new Date()
        let tomorrow = new Date()
        tomorrow.setDate(today.getDate() + 1)
        const newProduct = {
            id: +(new Date()),
            title: newVideoCreatedData.title,
            author: newVideoCreatedData.author,
            canBeDownloaded: false,
            minAgeRestriction: null,
            createdAt: today.toISOString(),
            publicationDate: tomorrow.toISOString(),
            availableResolutions: newVideoCreatedData.availableResolutions
        }
        db.videos.push(newProduct)
        return newProduct
    },
    updateVideo(videoId: number, updateVideoData: videosInputType) {
        const video = this.findVideoById(videoId)
        if (video) {
            video.title = updateVideoData.title
            video.author = updateVideoData.author
            video.canBeDownloaded = updateVideoData.canBeDownloaded
            video.minAgeRestriction = updateVideoData.minAgeRestriction
            video.publicationDate = new Date().toISOString()
            video.availableResolutions = updateVideoData.availableResolutions

            return true
        } else {
            return false
        }
    },
    deleteVideo(id:number){
        for (let i = 0; i < db.videos.length; i++) {
            if (db.videos[i].id === id) {
                db.videos.splice(i, 1);
                return true
            }
        }
        return false
    }

}
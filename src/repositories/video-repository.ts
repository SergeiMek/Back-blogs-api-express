import {db} from "../db/db";
import {newVideoCreatedDataType, videosInputType} from "../types/videosType";
import {videosCollection} from "../db/dbInMongo";
import {blogsDBType, videoDBType, videoType} from "../db/dbType";
import {promises} from "dns";
import Document from "mongodb";

export const videoRepository = {
    async getAllVideo(): Promise<videoType[]> {
        //return db.videos
        const videos = await videosCollection.find({}).toArray()
        return this._videoMapping(videos)
    },
    async findVideoById(id: number): Promise<videoType | null> {

        let video = await videosCollection.findOne({id: id})
        if (video) {
            return {
                id: video.id,
                title: video.title,
                author: video.author,
                canBeDownloaded: video.canBeDownloaded,
                minAgeRestriction: video.minAgeRestriction,
                createdAt: video.createdAt,
                publicationDate: video.publicationDate,
                availableResolutions: video.availableResolutions
            }
        } else {
            return null
        }


        // return db.videos.find(v => v.id === id)

    },
    async createdVideo(newVideoCreatedData: newVideoCreatedDataType): Promise<videoType> {
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
        const result = await videosCollection.insertOne(newProduct)
        // @ts-ignore
        delete newProduct._id
        return newProduct
    },
    async updateVideo(videoId: number, updateVideoData: videosInputType): Promise<boolean> {
        ///const video = this.findVideoById(videoId)
        const updatedParamsVideo = {
            title: updateVideoData.title,
            author: updateVideoData.author,
            canBeDownloaded: updateVideoData.canBeDownloaded,
            minAgeRestriction: updateVideoData.minAgeRestriction,
            availableResolutions: updateVideoData.availableResolutions
        }

        const result = await videosCollection.updateOne({id: videoId}, {$set: updatedParamsVideo})

        return result.matchedCount === 1
    },
    async deleteVideo(id: number): Promise<boolean> {
        const result = await videosCollection.deleteOne({id: id})
        return result.deletedCount === 1

    },
    async _videoMapping(array: videoDBType[]): Promise<videoType[]> {
        return array.map((video) => {
            return {
                id: video.id,
                title: video.title,
                author: video.author,
                canBeDownloaded: video.canBeDownloaded,
                minAgeRestriction: video.minAgeRestriction,
                createdAt: video.createdAt,
                publicationDate: video.publicationDate,
                availableResolutions: video.availableResolutions
            };
        });
    }

}
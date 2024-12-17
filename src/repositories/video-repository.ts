import {newVideoCreatedDataType, videosInputType} from "../types/videosType";
import {videoDBType, videoType} from "../db/dbType";
import {videosMongooseModel} from "../db/mongooseSchema/mongooseSchema";

export const videoRepository = {
    async getAllVideo(): Promise<videoType[]> {
        return videosMongooseModel.find({}).select('-_id').lean()

    },
    async findVideoById(id: number): Promise<videoType | null> {

        const video = await videosMongooseModel.findOne({id: id})
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
        const smartVideoModel = new videosMongooseModel(newProduct)
        await smartVideoModel.save()
        return {
            id: smartVideoModel.id,
            title: smartVideoModel.title,
            author: smartVideoModel.author,
            canBeDownloaded: false,
            minAgeRestriction: null,
            createdAt: smartVideoModel.createdAt,
            publicationDate: smartVideoModel.publicationDate,
            availableResolutions: newVideoCreatedData.availableResolutions
        }


    },
    async updateVideo(videoId: number, updateVideoData: videosInputType): Promise<boolean> {

        const updatedParamsVideo = {
            title: updateVideoData.title,
            author: updateVideoData.author,
            canBeDownloaded: updateVideoData.canBeDownloaded,
            minAgeRestriction: updateVideoData.minAgeRestriction,
            availableResolutions: updateVideoData.availableResolutions
        }
        const result = await videosMongooseModel.updateOne({id: videoId}, {$set: updatedParamsVideo})

        return result.modifiedCount === 1

    },
    async deleteVideo(id: number): Promise<boolean> {
        const result = await videosMongooseModel.deleteOne({id})
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
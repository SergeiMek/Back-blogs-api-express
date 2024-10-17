import {blogInputData, PostInputModel} from "./blogType";


export type FieldNamesType = keyof blogInputData | keyof PostInputModel
// const f: FieldsType = 'some' // error

export type OutputErrorsType = {
    errorsMessages: {message: string, field: FieldNamesType}[]
}
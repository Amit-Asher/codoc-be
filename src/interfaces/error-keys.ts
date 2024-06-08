export enum ErrorKey {
    InternalServerError = 'InternalServerError'
}

export const messagesByErrorKey: { [key in ErrorKey]?: string } = {
    [ErrorKey.InternalServerError]: 'Internal Server Error'
}

export enum ErrorCodes {
    CREATED = 'MOCK_0000',
    ALREADY_EXISTS = 'MOCK_0001',
    BAD_REQUEST = 'MOCK_0002',
    NOT_FOUND = 'MOCK_0003',
    SOMETHING_WENT_WRONG = 'MOCK_0004'
}

export const ErrorMessages = {
    [ErrorCodes.CREATED]: () => 'Created successfully.',
    [ErrorCodes.ALREADY_EXISTS]: (context?: string) => `${context || 'Item'} already exists.`,
    [ErrorCodes.BAD_REQUEST]: (context: string) => `Bad request. ${context} is required.`,
    [ErrorCodes.NOT_FOUND]: (context: string) => `${context} not found.`,
    [ErrorCodes.SOMETHING_WENT_WRONG]: () => `Something went wrong.`
}
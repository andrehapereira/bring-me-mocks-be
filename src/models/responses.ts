import { Response } from "express";
import { ErrorCodes, ErrorMessages } from "./error-codes";

interface ResponseSender {
    readonly responseInstace: Response;
    send(status: number, code: ErrorCodes, context?: string): any;
}

export class Sender implements ResponseSender {

    constructor(readonly responseInstace: Response<any, Record<string, any>>) {}

    send(status: number, code: ErrorCodes, context?: string) {
        return this.responseInstace.status(status).send({
            code,
            message: ErrorMessages[code](context)
        })
    }

    sendCustom<T>(status: number, body: T) {
        return this.responseInstace.status(status).send(body)
    }

}
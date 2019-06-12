import * as express from "express";
import {
    interfaces,
    controller,
    httpGet,
    httpPost,
    httpDelete,
    request,
    queryParam,
    response,
    requestParam
} from "inversify-express-utils";
import { injectable, inject } from "inversify";
import { IFileService } from "../../filesystem/IFileService";
import { TYPES } from "../../bootstrap/types";

@controller("/api/nodes")
export class NodeController implements interfaces.Controller {
    constructor(@inject(TYPES.FileService) private fileService: IFileService) {}

    @httpGet("/")
    private list(): string {
        return;
    }

    @httpDelete("/:id")
    private delete(@requestParam("id") id: string, @response() res: express.Response): Promise<void> {
        return;
    }
}

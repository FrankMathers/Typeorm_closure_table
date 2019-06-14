import * as express from "express";
import {
    interfaces,
    controller,
    httpGet,
    httpPut,
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
import { IModelManager } from "../../model/IModelManager";
import { IContentQuery } from "../../model/base/IModelQuery";
import { IModel } from "../../model/base/IModel";

@controller("/v1/apis/contents")
export class ContentController implements interfaces.Controller {
    @inject(TYPES.ModelManager) private modelManager: IModelManager;
    // constructor(@inject(TYPES.FileService) private fileService: IFileService) {}

    @httpGet("/*")
    private get(req: express.Request): Promise<IModel> {
        const url = req.url.replace("/v1/apis/contents/", "");

        const query: IContentQuery = { path: url, content: "" };

        return this.modelManager.getContent(query);

        // return this.fileService.readFileContent(url);
    }

    @httpPut("/*")
    private put(req: express.Request, res: express.Response): Promise<void> {
        const url = req.url.replace("/v1/apis/contents/", "");

        const query: IContentQuery = { path: url, content: req.body.content };

        this.modelManager.putContent(query);

        // this.fileService.writeFileContent(url, req.body.content);

        return;
    }
}

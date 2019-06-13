import "reflect-metadata";
import * as assert from "assert";
import { ModelManager } from "../../model/ModelManager";
import { INodeQuery, IContentQuery } from "../../model/base/IModelQuery";
import { createConnection, getManager } from "typeorm";
import { DIContainer } from "../../bootstrap/exports";
import * as sinon from "sinon";
import { IFileService } from "../../filesystem/IFileService";
import { TYPES } from "../../bootstrap/types";

suite("Model Service", () => {
    suite("getContent", async () => {
        // await createConnection();
        // const manager = new ModelManager();
        // manager.fileService = DIContainer.get<IFileService>(TYPES.FileService);
        // const query: IContentQuery = {
        //     path: "package.json"
        // };
        // const result = await manager.getContent(query);
        // assert.ok("test ok");
    });
});

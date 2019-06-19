import "reflect-metadata";
import * as express from "express";
import { DIContainer } from "../../../bootstrap/exports";
import { controller, httpGet, httpPut } from "inversify-express-utils";
import { InversifyExpressServer } from "inversify-express-utils";

suite("Test api-controller", () => {
    suite("Content Controller", async () => {
        test("Content Controller method: Get File content( )", done => {
            @controller("/v1/models/contents")
            class TestController {
                @httpGet("/*") private getTest(req: express.Request, res: express.Response) {
                    return new Promise(resolve => {
                        setTimeout(resolve, 100, "GET");
                    });
                }
            }

            const supertestnew = require("supertest");

            const server = new InversifyExpressServer(DIContainer);

            supertestnew(server.build())
                .get("/v1/models/contents/test.packages")
                .expect(200, "GET", done);
        });
    });
});

import express from "express";
import { IAPIService } from "./IAPIService";
import { Options } from "../bootstrap/Options";
import http from "http";
import logger from "../log/LogService";
import { injectable } from "inversify";
import * as bodyParser from "body-parser";
import "./controller/NodeController";
import { InversifyExpressServer } from "inversify-express-utils";
import DIContainer from "../bootstrap/Container";

@injectable()
export class APIService implements IAPIService {
    public app = express();
    // public server: http.Server;
    public async start(options: Options) {

        const server = new InversifyExpressServer(DIContainer);

        server.setConfig(app => {
            // add body parser
            app.use(
                bodyParser.urlencoded({
                    extended: true
                })
            );
            app.use(bodyParser.json());
        });
        server.build().listen(options.port, () => {
            logger.emitInfo("App is running at http://localhost:%d".replace("%d", options.port), "Restful API started");
            logger.emitInfo("APIService:start", "API service started");
        });
    }
}

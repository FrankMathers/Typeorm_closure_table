import express from "express";
import { IAPIService } from "./IAPIService";
import { Options } from "../bootstrap/Options";
import http from "http";
import logger from "../log/LogService";
import { injectable } from "inversify";
import * as bodyParser from "body-parser";
import "./controller/NodeController";
import "./controller/ContentController";
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
            // tslint:disable-next-line: only-arrow-functions
            app.all("*", function(req, res, next) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
                res.header("X-Powered-By", " 3.2.1");
                res.header("Content-Type", "application/json;charset=utf-8");
                next();
            });
        });
        server.build().listen(options.port, () => {
            logger.emitInfo("App is running at http://localhost:%d".replace("%d", options.port), "Restful API started");
            logger.emitInfo("APIService:start", "API service started");
        });
    }
}

import { Options } from "../bootstrap/Options";
import express from "express";

export interface IAPIService {

  app: express.Express;
  start(options: Options): Promise<void>;
}
import { DIContainer, dtsInstance, Options } from "./bootstrap/exports"
import logger from "./log/LogService"
import express from "express"

const expressInstance = dtsInstance.getExpressInstace();

export {
  DIContainer,
  dtsInstance,
  Options,
  logger,
  expressInstance,
  express
}
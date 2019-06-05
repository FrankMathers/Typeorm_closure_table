import DIContainer from "../bootstrap/Container";
import { TYPES } from "../bootstrap/types";
import { ILogService, LogServiceImpl } from "./LogService"

const logger: ILogService = new LogServiceImpl();

export default logger

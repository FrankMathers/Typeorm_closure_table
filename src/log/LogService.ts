import { injectable } from "inversify";
import winston from "winston";

export enum Severity {
  Error = "Error",
  Warning = "Warning",
  Performance = "Performance",
  Info = "Info",
  Debug = "Debug"
}

export interface ILogService {
  emitError(location: string, info: string, data?: any): void;
  emitDebug(location: string, info: string, data?: any): void;
  emitInfo(location: string, info: string, data?: any): void;

  setLogLevel(logLevel: Severity): void;
}

@injectable()
export class LogServiceImpl implements ILogService {

  private logger: winston.Logger;

  public constructor() {

    const logLevels = {
      levels: {
        Error: 0,
        Warning: 1,
        Performance: 2,
        Info: 3,
        Debug: 4
      },
      colors: {
        Error: "red",
        Warning: "yellow",
        Performance: "green",
        Info: "blue",
        Debug: "gray"
      }
    };

    const alignedWithColorsAndTime = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf((info: any) => {
        const { timestamp, level, message, ...args } = info;
        const ts = timestamp.slice(0, 19).replace("T", " ");

        return `${ts} [${level}]: ${message}`;
      })
    );

    winston.addColors(logLevels.colors);

    this.logger = winston.createLogger({
      levels: logLevels.levels,
      transports: [
        new winston.transports.Console({
          level: Severity.Debug,
          format: alignedWithColorsAndTime
        })]
    });
  }

  public emitError(location: string, info: string, data?: any) {
    return;
  }
  public emitDebug(location: string, info: string, data?: any) {
    return;
  }
  public emitInfo(location: string, info: string, data?: any) {
    this.logger.log({ level: Severity.Info, message: location + '-' + info });
  }

  public setLogLevel(logLevel: Severity) {
    this.logger.transports[0].level = logLevel;
  }
}


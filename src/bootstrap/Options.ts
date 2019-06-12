import { Severity } from "../log/LogService"
export class Options {
  public rootPath: string = process.cwd();
  public logLevel: Severity = Severity.Debug;
  public port: string = "5100";
}
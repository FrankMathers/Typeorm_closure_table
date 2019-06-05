import "reflect-metadata"
import DIContainer from "./bootstrap/Container";
import { DesignTimeService } from './bootstrap/DesignTimeService'
import { Options } from "./bootstrap/Options";
import { Severity } from "./log/LogService"

const dts: DesignTimeService = DIContainer.resolve<DesignTimeService>(DesignTimeService);

// Create options
const options: Options = new Options();
options.logLevel = Severity.Info;

dts.start(process.cwd(), options);

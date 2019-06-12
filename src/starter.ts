#!/usr/bin/env node

import { dtsInstance } from './bootstrap/exports'
import { Options } from "./bootstrap/Options";

// Create options
const options: Options = new Options();

// Parse parameters from command line
process.argv.forEach((val, index) => {
  // Start with specified file repository root path
  if (val === "-r" || val === "-R") {
    options.rootPath = process.argv[index + 1];
  }

  // Start with specified port number
  if (val === "-p" || val === "-P") {
    options.port = process.argv[index + 1];
  }
});

dtsInstance.start(options);

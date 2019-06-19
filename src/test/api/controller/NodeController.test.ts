import * as express from "express";
import { INodeQuery } from "../../../model/base/IModelQuery";
import * as assert from "assert";
import * as sinon from "sinon";
import { NodeController } from "../../../api/controller/NodeController";

/**
 *
 * Mocha 是具有丰富特性的 JavaScript 测试框架，可以运行在 Node.js 和浏览器中，使得异步测试更简单更有趣。
 * Mocha 可以持续运行测试，支持灵活又准确的报告，当映射到未捕获异常时转到正确的测试示例。
 * Chai 是一个针对 Node.js 和浏览器的行为驱动测试和测试驱动测试的断言库，可与任何 JavaScript 测试框架集成。
 * Sinon 是一个独立的 JavaScript 测试spy, stub, mock库，没有依赖任何单元测试框架工程。
 *
 */

suite("API NodeController", () => {
    suite("getQueryInfo", async () => {
        test("test test", () => {
            // API get data, assert result and expect.
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
    });
});

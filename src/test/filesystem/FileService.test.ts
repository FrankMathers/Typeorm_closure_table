import "reflect-metadata";
import * as assert from "assert";
import * as sinon from "sinon";
import fs from "fs";
import { DIContainer } from "../../bootstrap/exports";
import { IFileService } from "../../filesystem/IFileService";
import { TYPES } from '../../bootstrap/types'

suite("File System Servive", () => {
  suite("Read FileContent", async () => {
    test('Read file content successfully', async () => {
      const fakeFileName = "test.bo";
      const fileService = DIContainer.get<IFileService>(TYPES.FileService);
      // Mock fs.promises
      const mock = sinon.mock(fs.promises);
      mock.expects("readFile").withArgs(fakeFileName).once().returns("File content");
      // Read file content and assert result
      const fileContent = await fileService.readFileContent(fakeFileName);
      assert.equal(fileContent, "File content");
    });
  });
});

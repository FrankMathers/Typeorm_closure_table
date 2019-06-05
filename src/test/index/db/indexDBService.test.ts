import "reflect-metadata";
import * as assert from "assert";
import { IndexDBService } from "../../../index/db/IndexDBService";

suite("DB Servive", () => {
  suite("initIndexRepository", async () => {
    const DBService = new IndexDBService();
    await DBService.initIndexRepository();
    assert.ok("test ok");
  });
});

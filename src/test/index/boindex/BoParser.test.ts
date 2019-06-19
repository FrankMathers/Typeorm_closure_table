import "reflect-metadata";
import * as assert from "assert";
import { DIContainer } from "../../../bootstrap/exports";
import { IBoParser } from "../../../index/BoIndexutil/IBoParser";
import { TYPES } from "../../../bootstrap/types";

suite("Bo Parser", () => {
    suite("Parse Bo", async () => {
        test("Parse bo content successfully", async () => {
            const boParser = DIContainer.get<IBoParser>(TYPES.BoParser);
            const mockData = JSON.parse(`{
              "Key": {
                "BOName": "Business Partner",
                "BONamespace": "http://sap.com/x4/Metamodel"
              },
              "Nodes": 
              [
                {
                  "Key": 
                  {
                    "BOName": "Business Partner",
                    "BONamespace": "http://sap.com/x4/Metamodel",
                    "Name": "Root"
                  },
                  "ParentNodeName": "",
                  "Name": "Root",
                  "CategoryCode": "",
                  "Elements": [
                    {
                      "Key": 
                      {
                        "BOName": "Business Partner",
                        "BONamespace": "http://sap.com/x4/Metamodel",
                        "Name": "ID"
                      },
                      "Name": "ID"
                    }
                  ]
                 }
              ]
           }`);
            const resultNodeNumExp = 1;
            const resultNodeNameExp = "Root";
            // parse Bo and assert result

            const ParseContent = await boParser.parseBo(mockData, "Nodes[0]");
            assert.equal(ParseContent.children.length, resultNodeNumExp);
            assert.equal(ParseContent.name, resultNodeNameExp);
        });
    });
});

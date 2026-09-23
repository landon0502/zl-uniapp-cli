import JSON5 from 'json5'
import fs from 'node:fs'
import { toString } from "lodash";
export async function readJsonValue(jsonPath: string): any {
    let res = await fs.promises.readFile(jsonPath);
    let jsonValue = JSON5.parse(toString(res));
    return jsonValue;
}
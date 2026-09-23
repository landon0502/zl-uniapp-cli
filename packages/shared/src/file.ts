import fs from 'node:fs'
export async function writeFile(path, content) {
    let data = new Uint8Array(Buffer.from(content));
    await fs.promises.writeFile(path, data);
}
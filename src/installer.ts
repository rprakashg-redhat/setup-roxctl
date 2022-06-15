import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as ioUtil from "@actions/io/lib/io-util";
import * as fs from "mz/fs";
import * as path from "path";

import { FindBinaryStatus } from "./helper";
import { CLI_DOWNLOAD_PATH } from "./constants";

export class Installer {
    static async installRoxctl(centralUrl: string): Promise<FindBinaryStatus> {
        const url = path.join(centralUrl, CLI_DOWNLOAD_PATH);
        core.debug(`Downloading roxctl from ${url}`);
        return Installer.download(url);
    }

    static async download(url: string): Promise<FindBinaryStatus> {
        if (!url) {
            return { found: false, reason: "URL to download roxctl is not valid." };
        }
        const authHeader = `Authorization: Bearer ${process.env.ROX_API_TOKEN}`;
        const roxctlBinary = await tc.downloadTool(url, "", authHeader);
        if (!(await ioUtil.exists(roxctlBinary))) {
            return {
                found: false,
                reason: `An error occurred while downloading roxctl from ${url}.`
                + `File ${roxctlBinary} not found.`,
            };
        }
        fs.chmodSync(roxctlBinary, "0755");
        return {
            found: true,
            path: roxctlBinary,
        };
    }
}

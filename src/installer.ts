import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as ioUtil from "@actions/io/lib/io-util";
import * as fs from "mz/fs";
import * as path from "path";

import { FindBinaryStatus } from "./helper";
import { CLI_DOWNLOAD_PATH } from "./constants";

export class Installer {
    static async install(version: string, runnerOS: string): Promise<FindBinaryStatus> {
        let downloadUrl = path.join(CLI_DOWNLOAD_PATH);

        switch (runnerOS.toLowerCase()) {
        case "windows":
            downloadUrl = downloadUrl + version + "/bin/windows/roxctl";
            break;
        case "linux":
            downloadUrl = downloadUrl + version + "/bin/linux/roxctl";
            break;
        case "macos":
            downloadUrl = downloadUrl + version + "/bin/darwin/roxctl";
            break;
        default:
            throw new Error(`platform '${process.platform}' is not yet supported`);
        }

        core.debug(`Downloading roxctl from ${downloadUrl}`);
        return Installer.download(downloadUrl);
    }

    static async download(url: string): Promise<FindBinaryStatus> {
        if (!url) {
            return { found: false, reason: "URL to download roxctl is not valid." };
        }
        const roxctlBinary = await tc.downloadTool(url, "", "");
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

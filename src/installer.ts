import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as ioUtil from "@actions/io/lib/io-util";
import * as fs from "mz/fs";
import * as path from "path";

import { FindBinaryStatus } from "./helper";
import { RHACS_ASSETS_BASE_URL } from "./constants";

export class Installer {
    static async installRoxctl(version: string, runnerOS: string): Promise<FindBinaryStatus> {
        core.debug(`installing roxctl version: ${version} for OS: ${runnerOS}`);

        const url = await Installer.getDownloadUrl(version, runnerOS);
        if (!url) {
            core.debug("Error building roxctl download URL");
        }
        core.debug("Downloading roxctl");
        return Installer.download(url, runnerOS);
    }

    static async download(url: string, runnerOS: string): Promise<FindBinaryStatus> {
        if (!url) {
            return { found: false, reason: "URL to download roxctl is not valid." };
        }
        const roxctlBinary = await tc.downloadTool(url);
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
            path: path.join(roxctlBinary, Installer.roxCtlBinaryByOS(runnerOS)),
        };
    }

    static async getDownloadUrl(version: string, runnerOS: string): Promise<string> {
        let url: string | undefined = `${RHACS_ASSETS_BASE_URL}`;
        core.debug(`RHACS BASE URL: ${url}`);
        if (version !== "") {
            url += version + "/bin";
        }
        if (runnerOS === "Windows") {
            url += "/Windows/roxctl.exe";
        }
        else {
            url += "/Linux/roxctl";
        }
        core.debug(`Final roxctl download url: ${url}`);
        return url;
    }

    private static roxCtlBinaryByOS(osType: string): string {
        if (osType.includes("Windows")) return "roxctl.exe";
        return "roxctl";
    }
}

import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import { RHACS_ASSETS_BASE_URL } from './constants'
import { FindBinaryStatus } from "./helper";
import * as ioUtil from "@actions/io/lib/io-util";
import * as fs from "mz/fs";

export class Installer {
    static async installRoxctl(version: string, runnerOS: string): Promise<FindBinaryStatus> {
        core.debug(`installing roxctl version: ${version} for OS: ${runnerOS}`);

        const url = await Installer.getDownloadUrl(version, runnerOS);
        if (!url) {
            core.debug("Error building roxctl download URL")
        }
        core.debug("Downloading roxctl")
        return Installer.download(url);
    }

    static async download(url: string): Promise<FindBinaryStatus> {
        if (!url) {
            return { found: false, reason: "URL where to download s2i is not valid." };
        }
        
        let roxctl = await tc.downloadTool(url);
        if (!(await ioUtil.exists(roxctl))) {
            return {
                found: false,
                reason: `An error occurred while downloading roxctl from ${url}.`
                + `File ${roxctl} not found.`,
            };
        }
        fs.chmodSync(roxctl, "0755");
        return {
            found: true,
            path: roxctl
        };
    }

    static async getDownloadUrl(version: string, runnerOS: string): Promise<string> {
        let url: string | undefined = `${RHACS_ASSETS_BASE_URL}`;

        if (version != "") {
            url += version + "/bin";
        }
        if (runnerOS === "Windows") {
            url += "/Windows/roxctl.exe"
        } else {
            url += "/Linux/roxctl";
        }

        core.debug("Final roxctl download url: ${url}");
        return url;
    }
}




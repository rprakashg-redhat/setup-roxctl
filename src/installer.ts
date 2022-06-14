import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as ioUtil from "@actions/io/lib/io-util";
import * as fs from "mz/fs";
import * as glob from "glob";

import { FindBinaryStatus } from "./helper";
import { RHACS_ASSETS_BASE_URL } from "./constants";

export class Installer {
    static async installRoxctl(version: string, runnerOS: string): Promise<FindBinaryStatus> {
        core.info(`installing roxctl version: ${version} for OS: ${runnerOS}`);

        const url = await Installer.getDownloadUrl(version, runnerOS);
        if (!url) {
            core.debug("Error building roxctl download URL");
        }
        core.info("Downloading roxctl");
        return Installer.download(url, runnerOS);
    }

    static async download(url: string, runnerOS: string): Promise<FindBinaryStatus> {
        if (!url) {
            return { found: false, reason: "URL to download roxctl is not valid." };
        }
        let downloadDir = "";
        const f = await tc.downloadTool(url);
        if (runnerOS === "Windows") {
            downloadDir = await tc.extractZip(f);
        }
        else {
            downloadDir = await tc.extractTar(f);
        }
        let roxctlBinary: string = this.roxCtlBinaryByOS(runnerOS);
        roxctlBinary = await Installer.findroxCtlBinary(downloadDir, roxctlBinary);

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

    static async getDownloadUrl(version: string, runnerOS: string): Promise<string> {
        let url: string | undefined = `${RHACS_ASSETS_BASE_URL}`;
        core.info(`RHACS BASE URL: ${url}`);
        if (version !== "") {
            url += version + "/bin";
        }
        if (runnerOS === "Windows") {
            url += "/Windows/roxctl.exe";
        }
        else {
            url += "/Linux/roxctl";
        }
        core.info(`Final roxctl download url: ${url}`);
        return url;
    }

    private static roxCtlBinaryByOS(osType: string): string {
        if (osType.includes("Windows")) return "roxctl.exe";
        return "roxctl";
    }

    static async findroxCtlBinary(folder: string, file: string): Promise<string> {
        return new Promise((resolve, reject) => {
            glob(`${folder}/**/${file}`, (err, res) => {
                if (err) {
                    reject(new Error(`Unable to find s2i exewcutable inside the directory ${folder}`));
                }
                else {
                    resolve(res[0]);
                }
            });
        });
    }

}

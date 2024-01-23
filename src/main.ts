import * as core from "@actions/core";
import * as io from "@actions/io";
import { Inputs } from "./generated/inputs-outputs";
import { FindBinaryStatus } from "./helper";
import { Installer } from "./installer";

export async function run(): Promise<void> {
    const runnerOS = process.env.RUNNER_OS || process.platform;
    const version = core.getInput(Inputs.VERSION, { required: true });

    const roxctl = await io.which("roxctl", false);
    if (roxctl === "") {
        core.debug(`roxctl not installed, installing`);
        const binary: FindBinaryStatus = await Installer.install(version, runnerOS);
        if (binary.found === false) {
            throw new Error("Error installing");
        }
        core.debug("Installed roxctl");
        process.env.Path += ":" + binary.path;
    }
    else {
        core.debug("roxctl is already installed, skipping installation");
    }
}

run().catch(core.setFailed);

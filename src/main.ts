import * as core from "@actions/core";
import * as io from "@actions/io";
import { Inputs, Outputs } from "./generated/inputs-outputs";
import { FindBinaryStatus } from "./helper";
import { Installer } from "./installer";

export async function run(): Promise<void> {
    const runnerOS = process.env.RUNNER_OS || process.platform;
    const version = core.getInput(Inputs.VERSION, { required: true });
    const output = core.getInput(Inputs.OUTPUT_PATH, { required: false });

    const roxctl = await io.which("roxctl", false);
    if (roxctl === "") {
        core.debug(`roxctl not installed, installing`);
        const binary: FindBinaryStatus = await Installer.install(version, output, runnerOS);
        if (binary.found === false) {
            throw new Error("Error installing");
        }
        core.debug("Installed roxctl");
        core.setOutput(Outputs.BINARYPATH, binary.path);
    }
    else {
        core.debug("roxctl is already installed, skipping installation");
    }
}

run().catch(core.setFailed);

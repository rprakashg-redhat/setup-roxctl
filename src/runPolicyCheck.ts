import * as core from "@actions/core";
import * as io from "@actions/io";
import { Command } from "./command";
import { Inputs, Outputs } from "./generated/inputs-outputs";
import { FindBinaryStatus } from "./helper";
import { Installer } from "./installer";

export async function run(): Promise<void> {
    const apiToken = core.getInput(Inputs.API_TOKEN, { required: true });
    const centralUrl = core.getInput(Inputs.CENTRAL_URL, { required: true });
    const runnerOS = process.env.RUNNER_OS || process.platform;
    const image = core.getInput(Inputs.IMAGE, { required: true });

    process.env.ROX_API_TOKEN = apiToken;

    let roxctl = await io.which("roxctl", false);
    if (roxctl === "") {
        core.debug(`roxctl not installed, installing`);
        const binary: FindBinaryStatus = await Installer.installRoxctl(centralUrl);
        if (binary.found === false) {
            throw new Error("Error installing");
        }
        core.debug("Installed roxctl");
        roxctl = binary.path;
    }
    else {
        core.debug("roxctl is already installed, skipping installation");
    }
    core.debug(runnerOS);
    const imageCheckCmd = [
        "image check --json --print-all-violations --insecure-skip-tls-verify",
    ];

    // add central URL to command
    imageCheckCmd.push("--endpoint");
    imageCheckCmd.push(centralUrl + ":443");

    // add image to run policy checks on
    imageCheckCmd.push("--image");
    imageCheckCmd.push(image);

    const result = await Command.execute(roxctl, imageCheckCmd);
    if (result.exitCode !== 0) {
        core.setOutput(Outputs.PASS, false);
    }

    // set output
    core.setOutput(Outputs.PASS, true);
}

run().catch(core.setFailed);

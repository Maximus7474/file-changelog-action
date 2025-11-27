import * as core from '@actions/core';
import { SendWebhook } from './webhook';
import { SaveChangelog } from './saveChangelog';
import { getFileChangelog } from './getChangelog';

export async function run() {
  try {
    const data = await getFileChangelog();

    if (!data) return;
    const { changedFiles, version } = data;

    // checks for configuration happen within the modules, if not configured it'll return before any actions
    await SendWebhook(version, changedFiles, core);
    await SaveChangelog(version, changedFiles, core);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unexpected error occurred.');
    }
  }
}

if (!process.env.JEST_WORKER_ID) {
  run();
}

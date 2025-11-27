import * as core from '@actions/core';

export interface ActionConfig {
  githubToken: string;
  discordWebhook: string | false;
  changelogDir: string | false;
  changelogFilename: string | false;
}

export function getConfig(): ActionConfig {
  const githubToken = core.getInput('github_token', { required: true });
  const discordWebhook = core.getInput('webhook', { required: false }) || false;
  const changelogDir = core.getInput('changelog', { required: false }) || false;
  const changelogFilename = core.getInput('changelog_filename', { required: false }) || false;

  return {
    githubToken,
    discordWebhook,
    changelogDir,
    changelogFilename,
  };
}

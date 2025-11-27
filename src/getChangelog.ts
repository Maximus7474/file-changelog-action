import * as core from '@actions/core';
import * as github from '@actions/github';
import picomatch from 'picomatch';

import type { FileChangelog } from '../types/core';
import { getConfig } from './config';

function cleanUpChangelog(changelog: FileChangelog, ignorePatterns: string[]): FileChangelog {
  if (ignorePatterns.length === 0) {
    return changelog;
  }

  const isMatch = picomatch(ignorePatterns, { dot: true });

  const filterFiles = (files: string[]) => {
    return files.filter(filePath => {
      return !isMatch(filePath);
    });
  };

  return {
    added: filterFiles(changelog.added),
    removed: filterFiles(changelog.removed),
    modified: filterFiles(changelog.modified),
  };
}

export async function getFileChangelog() {
  const { githubToken, ignorePatterns } = getConfig()
  const octokit = github.getOctokit(githubToken);
  const { owner, repo } = github.context.repo;
  const currentSha = github.context.sha;

  core.info('Fetching latest tag...');

  const tagsResponse = await octokit.rest.repos.listTags({
    owner,
    repo,
    per_page: 2,
  });

  core.info(`tagsResponse.data: ${JSON.stringify(tagsResponse, null, 4)}`);

  if (tagsResponse.data.length === 0) {
    core.setFailed('No Git tags found in the repository.');
    return;
  }

  const latestTag = tagsResponse.data[0]!;
  const baseCommitSha = latestTag.commit.sha;

  core.info(`Latest Tag Found: ${latestTag.name}`);
  core.info(`Base Commit SHA (Tag): ${baseCommitSha}`);

  // if the latest tag is the current commit, there are no new changes
  if (baseCommitSha === currentSha) {
    core.info('The latest tag is the current HEAD. No new commits to compare.');
    return;
  }

  core.info(`Comparing commits between ${latestTag.name} and HEAD...`);

  const comparisonResponse = await octokit.rest.repos.compareCommits({
    owner,
    repo,
    base: baseCommitSha, // start from the tag commit
    head: currentSha,    // go up to the current commit
  });

  const { files } = comparisonResponse.data;

  const changedFiles: FileChangelog = {
    added: [],
    removed: [],
    modified: [],
  };

  if (files) {
    for (const file of files) {
      if (file.status === 'added')
        changedFiles.added.push(file.filename);
      else if (file.status === 'removed')
        changedFiles.removed.push(file.filename);
      else if (['modified', 'changed'].includes(file.status))
        changedFiles.modified.push(file.filename);
      else if (file.status === 'renamed' && file.previous_filename) {
        const oldFile = file.previous_filename,
          newFile = file.filename;

        changedFiles.removed.push(oldFile);
        changedFiles.added.push(newFile);
      }
    }

    return {
      changedFiles: cleanUpChangelog(changedFiles, ignorePatterns),
      version: latestTag.name
    };
  } else {
    core.info('No changes found, exiting...')
    return;
  }
}

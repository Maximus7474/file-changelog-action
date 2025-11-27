import * as github from '@actions/github';

import { CONTEXT_HEAD_SHA, CONTEXT_OWNER, CONTEXT_REPO, mockComparisonData, mockTagResponse } from './mockdata';
import { SendWebhook } from '../src/webhook';
import { SaveChangelog } from '../src/saveChangelog';

// mock the core module functions used in the action
jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  setFailed: jest.fn(),
  info: jest.fn(),
}));

// mock the github module context and getOctokit
jest.mock('@actions/github', () => ({
  context: {
    repo: {
      owner: CONTEXT_OWNER,
      repo: CONTEXT_REPO,
    },
    sha: CONTEXT_HEAD_SHA,
  },
  getOctokit: jest.fn(),
}));

jest.mock('../src/config', () => ({
  getConfig: jest.fn(),
}));

jest.mock('../src/webhook', () => ({
  SendWebhook: jest.fn(async () => {
  }),
}));

jest.mock('../src/saveChangelog', () => ({
  SaveChangelog: jest.fn(async () => {
  }),
}));

export const mockSendWebhook = SendWebhook as jest.Mock;
export const mockSaveChangelog = SaveChangelog as jest.Mock;

export const setupOctokitMocks = (
  tagResponse: any[] = mockTagResponse,
  comparisonResponse: any = mockComparisonData,
  tagError: Error | null = null,
  compareError: Error | null = null,
) => {
  const listTags = jest.fn();
  if (tagError) {
    listTags.mockRejectedValue(tagError);
  } else {
    listTags.mockResolvedValue({ data: tagResponse });
  }

  const compareCommits = jest.fn();
  if (compareError) {
    compareCommits.mockRejectedValue(compareError);
  } else {
    compareCommits.mockResolvedValue({ data: comparisonResponse });
  }


  const mockOctokit = {
    rest: {
      repos: {
        listTags,
        compareCommits,
      },
    },
  };

  (github.getOctokit as jest.Mock).mockReturnValue(mockOctokit);
  return mockOctokit.rest.repos;
};

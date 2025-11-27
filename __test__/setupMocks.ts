import * as github from '@actions/github';

import { CONTEXT_HEAD_SHA, CONTEXT_OWNER, CONTEXT_REPO, MOCK_BASE_SHA, MOCK_TAG_NAME, mockComparisonData, mockTagResponse } from './mockdata';

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

import { run } from '../src/index';
import * as core from '@actions/core';
import * as github from '@actions/github';

import { CONTEXT_HEAD_SHA, CONTEXT_OWNER, CONTEXT_REPO, MOCK_BASE_SHA, MOCK_TAG_NAME, mockComparisonData, mockTagResponse } from './mockdata';

// Mock the core module functions used in the action
jest.mock('@actions/core', () => ({
    getInput: jest.fn(),
    setFailed: jest.fn(),
    info: jest.fn(),
}));

// Mock the github module context and getOctokit
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

// Helper function to set up Octokit mocks
const setupOctokitMocks = (
    tagResponse: any[] = mockTagResponse,
    comparisonResponse: any = mockComparisonData,
    tagError: Error | null = null,
    compareError: Error | null = null,
) => {
    // Mock the API calls
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

describe('run', () => {
    beforeEach(() => {
        // Clear all mock function calls before each test
        jest.clearAllMocks();
        (core.getInput as jest.Mock).mockImplementation((name) => {
            if (name === 'github_token') return 'mock-token';
            return '';
        });
    });

    it('should successfully compare commits between the latest tag and HEAD', async () => {
        const reposMock = setupOctokitMocks();

        await run();

        // 1. Check token and octokit initialization
        expect(core.getInput).toHaveBeenCalledWith('github_token', { required: true });
        expect(github.getOctokit).toHaveBeenCalledWith('mock-token');

        // 2. Check tag fetching
        expect(reposMock.listTags).toHaveBeenCalledWith({
            owner: CONTEXT_OWNER,
            repo: CONTEXT_REPO,
            per_page: 1,
        });

        // 3. Check commit comparison
        expect(reposMock.compareCommits).toHaveBeenCalledWith({
            owner: CONTEXT_OWNER,
            repo: CONTEXT_REPO,
            base: MOCK_BASE_SHA,
            head: CONTEXT_HEAD_SHA,
        });

        // 4. Check results reporting
        expect(core.info).toHaveBeenCalledWith(`Latest Tag Found: ${MOCK_TAG_NAME}`);
        expect(core.info).toHaveBeenCalledWith(expect.stringContaining(`✅ Found 2 new commits since tag ${MOCK_TAG_NAME}.`));
        expect(core.setFailed).not.toHaveBeenCalled();
    });
});
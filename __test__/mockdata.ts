import type { DiffEntry } from "util";
import type { Commit, CompareCommits, Tag } from "../types/github";

export const CONTEXT_OWNER = 'test-owner';
export const CONTEXT_REPO = 'test-repo';
export const CONTEXT_HEAD_SHA = 'head-commit-sha';
export const MOCK_LATEST_TAG_NAME = 'v2.0.0';
export const MOCK_BASE_TAG_NAME = 'v1.0.0';
export const MOCK_LATEST_SHA = 'head-commit-sha';
export const MOCK_BASE_SHA = 'base-commit-sha';

export const mockTagResponse: Tag[] = [
  {
    node_id: 'node_id_latest',
    name: MOCK_LATEST_TAG_NAME,
    commit: { sha: MOCK_LATEST_SHA, url: 'mock-tag-commit-url-latest' },
    zipball_url: 'mock-zip',
    tarball_url: 'mock-tar',
  },
  {
    node_id: 'node_id_base',
    name: MOCK_BASE_TAG_NAME,
    commit: { sha: MOCK_BASE_SHA, url: 'mock-tag-commit-url-base' },
    zipball_url: 'mock-zip',
    tarball_url: 'mock-tar',
  }
];

export const MOCK_COMMITS: Commit[] = [
  {
    sha: 'commit-sha-2',
    url: 'mock-commit-url-2',
    html_url: 'mock-html-url-2',
    node_id: 'mock-node-2',
    commit: {
      author: { name: 'Dev B' },
      message: 'Feature: New awesome feature\n\nDetails...',
      tree: { sha: 'mock-tree-sha', url: 'mock-tree-url' },
      url: 'mock-commit-url-inner-2',
      comment_count: 0,
    },
  } as Commit,
  {
    sha: 'commit-sha-1',
    url: 'mock-commit-url-1',
    html_url: 'mock-html-url-1',
    node_id: 'mock-node-1',
    commit: {
      author: { name: 'Dev A' },
      message: 'Fix: Quick bug fix',
      tree: { sha: 'mock-tree-sha', url: 'mock-tree-url' },
      url: 'mock-commit-url-inner-1',
      comment_count: 0,
    },
  } as Commit,
];

export const MOCK_FILECHANGES: DiffEntry[] = [
  { status: 'modified', filename: 'src/file1.ts', sha: 'file-sha-1', changes: 1, additions: 1, deletions: 0, blob_url: 'mock-blob', raw_url: 'mock-raw' } as unknown as DiffEntry,
  { status: 'modified', filename: 'src/file2.ts', sha: 'file-sha-2', changes: 1, additions: 1, deletions: 0, blob_url: 'mock-blob', raw_url: 'mock-raw' } as unknown as DiffEntry,
  { status: 'added', filename: 'tests/file2.test.ts', sha: 'file-sha-2', changes: 1, additions: 1, deletions: 0, blob_url: 'mock-blob', raw_url: 'mock-raw' } as unknown as DiffEntry,
  { status: 'removed', filename: 'old/legacy.js', sha: 'file-sha-3', changes: 0, additions: 0, deletions: 0, blob_url: 'mock-blob', raw_url: 'mock-raw' } as unknown as DiffEntry,
  { status: 'renamed', filename: 'new/config.yaml', previous_filename: 'old/config.yml', sha: 'file-sha-4', changes: 0, additions: 0, deletions: 0, blob_url: 'mock-blob', raw_url: 'mock-raw' } as unknown as DiffEntry,
];

export const mockComparisonData: CompareCommits = {
  status: 'ahead',
  ahead_by: MOCK_COMMITS.length,
  behind_by: 0,
  total_commits: MOCK_COMMITS.length,
  commits: MOCK_COMMITS,
  files: MOCK_FILECHANGES,
} as unknown as CompareCommits;

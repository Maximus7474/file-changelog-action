import * as core from "@actions/core";
import { writeFile } from "fs/promises";
import path from "path";

import type { FileChangelog } from "../types/core";

import { getConfig } from "./config";

type ActionCore = typeof core;
type AcceptedFileFormat = "txt" | "md";

function getFileFormat(filename: string): AcceptedFileFormat {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.md') return "md"
  else return "txt";
}

function formatChangelogList(
  files: string[],
  title: string,
  fileFormat: AcceptedFileFormat,
): string {
  if (files.length === 0) return "";

  let content = "";
  if (fileFormat === 'md') {
    content += `## ${title}:\n`;
    content += files.map((e) => `* ${e}`).join("\n");
    content += "\n\n";
  } else {
    content += `${title}:\n`;
    content += files
      .map((e, i) => ` ${i === files.length - 1 ? "└" : "├"} ${e}`)
      .join("\n");
    content += "\n\n";
  }

  return content;
}

export async function SaveChangelog(versionRef: string, changelog: FileChangelog, core: ActionCore) {
  const { changelogDir, changelogFilename } = getConfig();
  if (!changelogDir || !changelogFilename) return;

  const fileFormat = getFileFormat(changelogFilename);

  let fileContent: string;

  if (fileFormat === 'md') fileContent = `# Changelog for release ${versionRef}\n\n`;
  else fileContent = `Changelog for release ${versionRef}\n\n`;

  fileContent += formatChangelogList(
    changelog.added, "Added files", fileFormat
  );

  fileContent += formatChangelogList(
    changelog.removed, "Removed files", fileFormat
  );

  fileContent += formatChangelogList(
    changelog.modified, "Modified files", fileFormat
  );

  const filePath = path.join(changelogDir, changelogFilename);
  await writeFile(filePath, fileContent);

  core.info(`Saved changelog to file: ${filePath}`);
}

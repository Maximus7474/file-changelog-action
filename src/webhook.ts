import * as core from "@actions/core";

import type { FileChangelog } from "../types/core";
import type { WebhookPayload } from "../types/webhook";

type ActionCore = typeof core;

export async function SendWebhook(webhook: string, versionRef: string, changelog: FileChangelog, core: ActionCore) {
  if (!webhook || typeof webhook !== 'string') {
    throw new Error('Invalid or missing Discord Webhook URL.');
  }

  let payload: WebhookPayload = {
    content: `## File changelog for ${versionRef}`,
    embeds: []
  };

  if (changelog.added.length > 0) {
    payload.embeds.push({
      title: 'Added files:',
      description:
        `\`\`\`ansi\n[0;32m${changelog.added.map(e => `+ ${e}`).join('\n')}\n\`\`\``
    });
  }

  if (changelog.removed.length > 0) {
    payload.embeds.push({
      title: 'Removed files:',
      description:
        `\`\`\`ansi\n[0;31m${changelog.removed.map(e => `+ ${e}`).join('\n')}\n\`\`\``
    });
  }

  if (changelog.modified.length > 0) {
    payload.embeds.push({
      title: 'Modified files:',
      description:
        `\`\`\`ansi\n[0;33m${changelog.modified.map(e => `+ ${e}`).join('\n')}\n\`\`\``
    });
  }

  try {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    if (response.status !== 204) {
      throw new Error(`Failed to send webhook. Status: ${response.status} - Response: ${await response.text()}`);
    }

    core.info('Webhook sent successfully');
  } catch (err) {
    core.error(`Error sending Discord webhook: ${(err as Error).message}`);
    throw err;
  }
}

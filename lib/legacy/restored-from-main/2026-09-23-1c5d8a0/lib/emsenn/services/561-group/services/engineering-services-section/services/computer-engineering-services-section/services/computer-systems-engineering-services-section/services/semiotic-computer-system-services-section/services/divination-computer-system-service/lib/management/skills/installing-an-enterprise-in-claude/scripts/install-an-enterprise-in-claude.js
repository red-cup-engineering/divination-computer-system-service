#!/usr/bin/env node
import { installEnterpriseInClaude } from "@red-cup-engineering/claude-harness-projection-service/install-enterprise-in-claude";

try {
  await installEnterpriseInClaude();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

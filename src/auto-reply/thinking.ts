import {
  resolveProviderBinaryThinking,
  resolveProviderDefaultThinkingLevel,
  resolveProviderXHighThinking,
} from "../plugins/provider-runtime.js";
import {
  formatThinkingLevelLabels,
  listThinkingLevels as listSharedThinkingLevels,
  normalizeProviderId,
  resolveThinkingDefaultForModelFallback,
  type ThinkLevel,
  type ThinkingCatalogEntry,
} from "./thinking-shared.js";

export type {
  ElevatedLevel,
  ElevatedMode,
  NoticeLevel,
  ReasoningLevel,
  ThinkLevel,
  ThinkingCatalogEntry,
  UsageDisplayLevel,
  VerboseLevel,
} from "./thinking-shared.js";
export {
  formatXHighModelHint,
  normalizeElevatedLevel,
  normalizeFastMode,
  normalizeNoticeLevel,
  normalizeReasoningLevel,
  normalizeThinkLevel,
  normalizeUsageDisplay,
  normalizeVerboseLevel,
  resolveElevatedMode,
  resolveResponseUsageMode,
} from "./thinking-shared.js";

export function isBinaryThinkingProvider(provider?: string | null, model?: string | null): boolean {
  const normalizedProvider = normalizeProviderId(provider);
  if (!normalizedProvider) {
    return false;
  }

  const pluginDecision = resolveProviderBinaryThinking({
    provider: normalizedProvider,
    context: {
      provider: normalizedProvider,
      modelId: model?.trim() ?? "",
    },
  });
  if (typeof pluginDecision === "boolean") {
    return pluginDecision;
  }
  return false;
}

export function supportsXHighThinking(provider?: string | null, model?: string | null): boolean {
  const modelKey = model?.trim().toLowerCase();
  if (!modelKey) {
    return false;
  }
  const providerKey = normalizeProviderId(provider);
  if (providerKey) {
    const pluginDecision = resolveProviderXHighThinking({
      provider: providerKey,
      context: {
        provider: providerKey,
        modelId: modelKey,
      },
    });
    if (typeof pluginDecision === "boolean") {
      return pluginDecision;
    }
  }
  return false;
}

export function listThinkingLevels(provider?: string | null, model?: string | null): ThinkLevel[] {
  return listSharedThinkingLevels({ supportsXHigh: supportsXHighThinking(provider, model) });
}

export function listThinkingLevelLabels(provider?: string | null, model?: string | null): string[] {
  if (isBinaryThinkingProvider(provider, model)) {
    return ["off", "on"];
  }
  return listThinkingLevels(provider, model);
}

export function formatThinkingLevels(
  provider?: string | null,
  model?: string | null,
  separator = ", ",
): string {
  return formatThinkingLevelLabels({
    isBinary: isBinaryThinkingProvider(provider, model),
    supportsXHigh: supportsXHighThinking(provider, model),
    separator,
  });
}

export function resolveThinkingDefaultForModel(params: {
  provider: string;
  model: string;
  catalog?: ThinkingCatalogEntry[];
}): ThinkLevel {
  const normalizedProvider = normalizeProviderId(params.provider);
  const pluginDecision = resolveProviderDefaultThinkingLevel({
    provider: normalizedProvider,
    context: {
      provider: normalizedProvider,
      modelId: params.model,
      reasoning: params.catalog?.find(
        (entry) => entry.provider === params.provider && entry.id === params.model,
      )?.reasoning,
    },
  });
  if (pluginDecision) {
    return pluginDecision;
  }
  return resolveThinkingDefaultForModelFallback(params);
}

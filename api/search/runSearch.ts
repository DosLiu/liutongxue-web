import {
  buildFallbackQueries,
  classifyTrustLevel,
  detectSearchIntent,
  isBlockedResult,
  SEARCH_POLICY,
  shouldAllowUnknownHosts
} from './policy.ts';
import type { SearchIntent, SearchProvider, SearchResultItem } from './policy.ts';

type RawSearchResultItem = {
  title: string;
  url: string;
  snippet: string;
  provider: SearchProvider;
  position: number;
};

type SearchAttempt = {
  query: string;
  relaxed: boolean;
  providerPreference: 'bing-first' | 'baidu-first';
};

const env = ((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {});
const SEARCH_ENABLED = env.WEB_SEARCH_ENABLED !== '0';
const SEARCH_TOP_K = Math.min(
  Math.max(Number.parseInt(env.WEB_SEARCH_TOP_K || String(SEARCH_POLICY.topK), 10) || SEARCH_POLICY.topK, 1),
  8
);

const decodeHtml = (value: string) =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x2F;/g, '/')
    .replace(/&#47;/g, '/')
    .replace(/\s+/g, ' ')
    .trim();

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const normalizeUrl = (value: string) => {
  try {
    const url = new URL(value);
    url.hash = '';
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'from', 'source'].forEach((key) => {
      url.searchParams.delete(key);
    });
    return trimTrailingSlash(url.toString());
  } catch {
    return value.trim();
  }
};

const getHostname = (value: string) => {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
};

const scoreTrustLevel = (trustLevel: SearchResultItem['trustLevel']) => {
  switch (trustLevel) {
    case 'official':
      return 300;
    case 'trusted':
      return 220;
    case 'reference':
      return 140;
    default:
      return 60;
  }
};

const scoreProvider = (provider: SearchProvider, providerPreference: SearchAttempt['providerPreference']) => {
  if (providerPreference === 'bing-first') {
    return provider === 'bing-cn' ? 40 : 20;
  }
  return provider === 'baidu' ? 40 : 20;
};

const fetchText = async (url: string, timeoutMs: number) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LiutongxueBot/1.0; +https://dosliu.github.io/liutongxue-web/)',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      },
      signal: controller.signal
    });

    if (!response.ok) return '';
    return await response.text();
  } catch {
    return '';
  } finally {
    clearTimeout(timeoutId);
  }
};

const extractBingResults = (xml: string) => {
  const results: RawSearchResultItem[] = [];
  const pattern = /<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<description>([\s\S]*?)<\/description>[\s\S]*?<\/item>/g;

  for (const match of xml.matchAll(pattern)) {
    const title = decodeHtml(match[1] || '');
    const url = normalizeUrl(decodeHtml(match[2] || ''));
    const snippet = decodeHtml(match[3] || '');

    if (!title || !url) continue;

    results.push({
      title,
      url,
      snippet,
      provider: 'bing-cn',
      position: results.length + 1
    });

    if (results.length >= 8) break;
  }

  return results;
};

const searchWithBingCn = async (query: string) => {
  const xml = await fetchText(
    `https://cn.bing.com/search?format=rss&q=${encodeURIComponent(query)}&setlang=zh-Hans&ensearch=0`,
    SEARCH_POLICY.providerTimeoutMs
  );

  if (!xml) return [];
  return extractBingResults(xml);
};

const extractBaiduResults = (html: string) => {
  const results: RawSearchResultItem[] = [];
  const pattern = /<div[^>]+mu="([^"]+)"[\s\S]{0,2200}?<h3[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>[\s\S]{0,1800}?(?:<div[^>]+class="[^"]*(?:c-abstract|content-right_8Zs40|content-right_[^"]*)[^"]*"[^>]*>([\s\S]*?)<\/div>|<span[^>]+class="[^"]*(?:c-color-text|content-right_8Zs40)[^"]*"[^>]*>([\s\S]*?)<\/span>)?/g;

  for (const match of html.matchAll(pattern)) {
    const url = normalizeUrl(decodeHtml(match[1] || ''));
    const title = decodeHtml(match[2] || '');
    const snippet = decodeHtml(match[3] || match[4] || '');

    if (!title || !url) continue;

    results.push({
      title,
      url,
      snippet,
      provider: 'baidu',
      position: results.length + 1
    });

    if (results.length >= 8) break;
  }

  return results;
};

const searchWithBaidu = async (query: string) => {
  const html = await fetchText(
    `https://www.baidu.com/s?wd=${encodeURIComponent(query)}&rn=10&ie=utf-8`,
    SEARCH_POLICY.providerTimeoutMs
  );

  if (!html) return [];
  return extractBaiduResults(html);
};

const mergeAndRankResults = (
  items: RawSearchResultItem[],
  intent: SearchIntent,
  attempt: SearchAttempt
): SearchResultItem[] => {
  const deduped = new Map<string, SearchResultItem>();

  for (const item of items) {
    const hostname = getHostname(item.url);
    const title = item.title.trim();
    const snippet = item.snippet.trim();

    if (!title || !hostname) continue;
    if (isBlockedResult({ hostname, title, snippet })) continue;

    const trustLevel = classifyTrustLevel({ hostname, title, snippet });
    const allowUnknown = shouldAllowUnknownHosts(intent, attempt.relaxed);

    if (trustLevel === 'unknown' && !allowUnknown) continue;

    const normalizedUrl = normalizeUrl(item.url);
    const existing = deduped.get(normalizedUrl);
    const candidate: SearchResultItem = {
      title,
      url: normalizedUrl,
      snippet,
      provider: item.provider,
      position: item.position,
      hostname,
      trustLevel
    };

    if (!existing) {
      deduped.set(normalizedUrl, candidate);
      continue;
    }

    const currentScore = scoreTrustLevel(existing.trustLevel) + scoreProvider(existing.provider, attempt.providerPreference) - existing.position;
    const nextScore = scoreTrustLevel(candidate.trustLevel) + scoreProvider(candidate.provider, attempt.providerPreference) - candidate.position;

    if (nextScore > currentScore) {
      deduped.set(normalizedUrl, candidate);
    }
  }

  return [...deduped.values()]
    .sort((left, right) => {
      const scoreLeft = scoreTrustLevel(left.trustLevel) + scoreProvider(left.provider, attempt.providerPreference) - left.position;
      const scoreRight = scoreTrustLevel(right.trustLevel) + scoreProvider(right.provider, attempt.providerPreference) - right.position;
      return scoreRight - scoreLeft;
    })
    .slice(0, SEARCH_TOP_K);
};

const buildAttempts = (query: string, intent: SearchIntent): SearchAttempt[] => {
  const variants = buildFallbackQueries(query, intent);

  return [
    {
      query: variants[0] || query,
      relaxed: false,
      providerPreference: 'bing-first'
    },
    {
      query: variants[1] || variants[0] || query,
      relaxed: false,
      providerPreference: 'baidu-first'
    },
    {
      query: variants[2] || variants[1] || variants[0] || query,
      relaxed: true,
      providerPreference: intent === 'official' ? 'bing-first' : 'baidu-first'
    }
  ];
};

const buildPromptContext = (query: string, results: SearchResultItem[]) => {
  if (!results.length) return '';

  const items = results
    .map((item, index) => {
      const trustLabel =
        item.trustLevel === 'official'
          ? '官方'
          : item.trustLevel === 'trusted'
            ? '高可信'
            : item.trustLevel === 'reference'
              ? '参考'
              : '候选';

      return `${index + 1}. [${trustLabel}] 标题：${item.title}\n链接：${item.url}\n摘要：${item.snippet || '无摘要'}`;
    })
    .join('\n\n');

  return `以下是围绕用户问题“${query}”的外部检索摘要。\n这些内容只作为事实参考，不要机械复述；先判断，再引用最关键的一两条事实。\n如果结果之间存在冲突，直接指出冲突，不要装作确定。\n\n${items}`;
};

export const getSearchContext = async (query: string) => {
  if (!SEARCH_ENABLED) return '';

  const intent = detectSearchIntent(query);
  if (!intent) return '';

  const attempts = buildAttempts(query, intent);

  for (const attempt of attempts) {
    const [bingResults, baiduResults] = await Promise.all([searchWithBingCn(attempt.query), searchWithBaidu(attempt.query)]);
    const rankedResults = mergeAndRankResults([...bingResults, ...baiduResults], intent, attempt);

    if (rankedResults.length >= 2) {
      return buildPromptContext(query, rankedResults);
    }
  }

  return '';
};

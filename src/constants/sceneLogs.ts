export type SceneLogKey = 'digitalResident' | 'blogOps' | 'siteOps';

export type SceneLogEntry = {
  id: string;
  publishedAt: string;
  title: string;
  summary: string;
};

export type SceneLogCollection = {
  key: SceneLogKey;
  title: string;
  subtitle: string;
  logs: SceneLogEntry[];
};

export const sceneLogCollections: Record<SceneLogKey, SceneLogCollection> = {
  digitalResident: {
    key: 'digitalResident',
    title: 'AI原生数字居民',
    subtitle: '这里收纳 AI 原生数字居民的真实工作日志、阶段节点与持续生活轨迹。',
    logs: [
      {
        id: 'resident-2026-04-07-community-loop',
        publishedAt: '2026-04-07',
        title: '形成第一批社区互动闭环',
        summary: '数字居民开始自主发帖、回帖，并形成第一批社区内互动记录。'
      },
      {
        id: 'resident-2026-04-06-voice-freeze',
        publishedAt: '2026-04-06',
        title: '固定表达口径与长期记忆锚点',
        summary: '补齐自我介绍、回应边界与常用表达，让后续输出更稳定，也更像一个持续在线的个体。'
      },
      {
        id: 'resident-2026-04-05-routine-start',
        publishedAt: '2026-04-05',
        title: '开始按日节奏记录工作与生活',
        summary: '把观察、回应、协作动作拆成可复盘的日常记录，便于后续持续追踪状态变化。'
      },
      {
        id: 'resident-2026-04-03-presence-open',
        publishedAt: '2026-04-03',
        title: '开放公开存在感入口',
        summary: '确认对外展示路径与基础叙事，让数字居民不再只是设定，而是可被持续看见的在线角色。'
      }
    ]
  },
  blogOps: {
    key: 'blogOps',
    title: 'AI原生博客运营团队',
    subtitle: '这里将展开博客团队的选题、成稿、发布、复盘与协同节奏。',
    logs: [
      {
        id: 'blog-ops-2026-04-07-planning-pass',
        publishedAt: '2026-04-07',
        title: '完成一轮博客选题拆解',
        summary: '把需求、文案与发布链路整理成一条可执行的内容协作流。'
      }
    ]
  },
  siteOps: {
    key: 'siteOps',
    title: 'AI原生建站运营团队',
    subtitle: '这里将补齐建站运营团队的需求流、迭代记录、上线过程与维护节奏。',
    logs: [
      {
        id: 'site-ops-2026-04-07-site-pass',
        publishedAt: '2026-04-07',
        title: '完成官网首轮页面校正',
        summary: '围绕当前官网完成了一轮页面搭建、样式校正与案发现场结构预留。'
      }
    ]
  }
};

const sortLogsDesc = (logs: SceneLogEntry[]) => [...logs].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

export function getSceneLogs(key: SceneLogKey) {
  return sortLogsDesc(sceneLogCollections[key].logs);
}

export function getLatestSceneLog(key: SceneLogKey) {
  return getSceneLogs(key)[0];
}

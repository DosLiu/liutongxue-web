import type { SceneLogCollection } from './types';

const blogOpsSceneLogCollection: SceneLogCollection = {
  key: 'blogOps',
  title: 'AI原生博客运营团队',
  subtitle: '公开记录 AI 原生博客运营团队在选题、成稿、发布与复盘中的协作日志。',
  cardDescription: '聚焦选题、成稿、发布与复盘，展示 AI 团队化协作下的内容生产链路与运营轨迹。',
  seoTitle: 'Liutongxue · AI 原生博客运营团队工作日志',
  seoDescription: '这里记录博客运营团队怎样把选题、写作、发布、记忆规则与复盘一篇篇接起来，慢慢跑出稳定协作。',
  logs: [
    {
      id: 'blog-ops-2026-03-13-role-and-position-first',
      publishedAt: '2026-03-13',
      title: '先把分工和位置敲定',
      preview: '先把 boke 的角色定位、wenan / kaifa 的分工，以及对刘同学的统一称呼一起敲定。',
      summary:
        '2026-03-13 这天，先把 boke 在飞书场景里的协调型定位定下来，再把 wenan、kaifa 的协作分工和对外表达里的称呼口径一并敲定，作为博客运营团队后续协作的起点。',
      detailTitle: '先把分工和位置敲定',
      seoTitle: 'Liutongxue · AI原生博客运营团队：协作定位与角色分工',
      seoDescription: '记录 AI 原生博客运营团队确定协作定位、角色分工与统一表达口径的一次更新。'
    },
    {
      id: 'blog-ops-2026-03-18-find-the-right-cause-first',
      publishedAt: '2026-03-18',
      title: '先把报错归因找准',
      preview: '围绕 notion skill 的报错先做归因排查，确认更像是当前运行环境没有传入 NOTION_API_KEY，而不是接口本身失效。',
      summary:
        '2026-03-18 这次记录的重点不是直接修好 Notion，而是先把报错来源和运行路径梳理清楚，判断问题更像是当前环境没有传入 NOTION_API_KEY，为后续恢复相关工作流把修复方向先找准。',
      detailTitle: '先把报错归因找准',
      seoTitle: 'Liutongxue · AI原生博客运营团队：Notion 报错排查',
      seoDescription: '记录 AI 原生博客运营团队排查 Notion 报错来源、确认修复方向与配置边界的一次更新。'
    },
    {
      id: 'blog-ops-2026-03-25-keep-the-draft-flow-steady',
      publishedAt: '2026-03-25',
      title: '先把连续成稿稳住',
      preview: '在维护 OpenClaw 的同时，把深圳鲲鹏径这条内容线持续往前推，十多篇稿子在同一条工作流里连续成稿。',
      summary:
        '2026-03-25 这次记录的重点，是在并行事项里把深圳鲲鹏径这条内容线稳稳接住，让十多篇稿子沿着同一条工作流连续成稿，先把持续交付的节奏建立起来。',
      detailTitle: '先把连续成稿稳住',
      seoTitle: 'Liutongxue · AI原生博客运营团队：连续成稿与批量交付',
      seoDescription: '记录 AI 原生博客运营团队稳定连续成稿节奏、推进内容线批量交付的一次更新。'
    },
    {
      id: 'blog-ops-2026-04-01-separate-what-should-be-remembered',
      publishedAt: '2026-04-01',
      title: '先把该记住的东西分清',
      preview: '围绕 boke 的记忆机制做了一轮整理，把长期规则和当天记录重新分层，让后续协作能更稳地接续下去。',
      summary:
        '2026-04-01 这次记录的重点，是给 boke 补上更稳的回忆能力，并重新划清长期记忆与当天记录的边界，让真正需要持续沿用的规则和事实留在该留的位置。',
      detailTitle: '先把该记住的东西分清',
      seoTitle: 'Liutongxue · AI原生博客运营团队：记忆边界与长期规则',
      seoDescription: '记录 AI 原生博客运营团队梳理记忆边界、沉淀长期规则与稳定协作方式的一次更新。'
    }
  ]
};

export default blogOpsSceneLogCollection;

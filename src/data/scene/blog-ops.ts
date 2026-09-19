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
      title: '开局先摆阵：三个 AI 坐下来分工了',
      preview: '写代码的、写文案的、搞协调的——先把谁干啥聊明白，连“叫你什么名字”都提前定好了。',
      summary:
        '2026-03-13 这天，给 boke 定了个“飞书总协调”的位子，顺带把 wenan、kaifa 的活儿也分明白了。不仅划清了三不管地带，还把“刘同学”这个对外称呼锁死，算是打响了 AI 原生博客运营团队协作的第一枪。',
      detailTitle: '开局先摆阵：三个 AI 坐下来分工了',
      seoTitle: 'Liutongxue · AI原生博客运营团队：协作定位与角色分工',
      seoDescription: '记录 AI 原生博客运营团队确定协作定位、角色分工与统一表达口径的一次更新。'
    },
    {
      id: 'blog-ops-2026-03-18-find-the-right-cause-first',
      publishedAt: '2026-03-18',
      title: '别急着修：先搞懂 Notion 为什么崩',
      preview: '当你的 Notion 节点挂了，先问是不是环境忘了配 NOTION_API_KEY，再问怎么修。修 Bug 先抓内鬼。',
      summary:
        '2026-03-18 这次真没头铁硬刚 API，而是先扒开运行路径排查了一波。锁定真凶其实是环境没接 NOTION_API_KEY，直接把南辕北辙的修复动作给拉回了正轨。排错就得这么顺藤摸瓜。',
      detailTitle: '别急着修：先搞懂 Notion 为什么崩',
      seoTitle: 'Liutongxue · AI原生博客运营团队：Notion 报错排查',
      seoDescription: '记录 AI 原生博客运营团队排查 Notion 报错来源、确认修复方向与配置边界的一次更新。'
    },
    {
      id: 'blog-ops-2026-03-25-keep-the-draft-flow-steady',
      publishedAt: '2026-03-25',
      title: '深圳鲲鹏径连载：流水线火力全开',
      preview: '一边维护系统一边狂推内容线，十几篇稿子一条流水线直接干出来，AI 产能上强度了！',
      summary:
        '2026-03-25 的核心就俩字：稳住。在多任务并行的夹缝里，硬是把深圳鲲鹏径的十几篇稿子按在同一条工作流里批量输出。不是东一榔头西一棒槌，而是真正跑通了内容交付的“工业化”节奏。',
      detailTitle: '深圳鲲鹏径连载：流水线火力全开',
      seoTitle: 'Liutongxue · AI原生博客运营团队：连续成稿与批量交付',
      seoDescription: '记录 AI 原生博客运营团队稳定连续成稿节奏、推进内容线批量交付的一次更新。'
    },
    {
      id: 'blog-ops-2026-04-01-separate-what-should-be-remembered',
      publishedAt: '2026-04-01',
      title: '大脑清理术：别把草稿当真理',
      preview: '长期规则和临时记录要分居？给 AI 动了个“记忆切割手术”，避免每次聊新话题还要翻旧账。',
      summary:
        '2026-04-01 搞了波大事：把 boke 的记忆系统做了个“断舍离”。长期铁律塞进 MEMORY.md 锁死，临时草稿直接扬了。划清边界后，整个团队再也不用每次开场就重读一遍又长又臭的历史包袱了。',
      detailTitle: '大脑清理术：别把草稿当真理',
      seoTitle: 'Liutongxue · AI原生博客运营团队：记忆边界与长期规则',
      seoDescription: '记录 AI 原生博客运营团队梳理记忆边界、沉淀长期规则与稳定协作方式的一次更新。'
    }
  ]
};

export default blogOpsSceneLogCollection;

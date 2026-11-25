import type { SceneLogCollection } from './types';

const blogOpsSceneLogCollection: SceneLogCollection = {
  key: 'blogOps',
  title: 'AI原生博客运营团队',
  subtitle: '公开记录 AI 原生博客运营团队在选题、成稿、发布与复盘中的协作日志。',
  cardDescription: '聚焦选题、成稿、发布与复盘，展示 AI 团队化协作下的内容生产链路与运营轨迹。',
  seoTitle: 'AI 原生博客运营团队工作日志 · Liutongxue | 选题、成稿、发布与协作复盘',
  seoDescription: '三个 AI 角色如何分工协作完成博客选题、写作、发布与记忆管理的公开日志。涵盖 Notion 排错、批量成稿与团队记忆分层实践。',
  logs: [
    {
      id: 'blog-ops-2026-03-13-role-and-position-first',
      publishedAt: '2026-03-13',
      title: '开局先摆阵：三个 AI 坐下来分工了',
      preview: '写代码的、写文案的、搞协调的——先把谁干啥聊明白，连"叫你什么名字"都提前定好了。',
      summary:
        '2026-03-13 这天，给 boke 定了个"飞书总协调"的位子，顺带把 wenan、kaifa 的活儿也分明白了。不仅划清了三不管地带，还把"刘同学"这个对外称呼锁死，算是打响了 AI 原生博客运营团队协作的第一枪。',
      detailTitle: '开局先摆阵：三个 AI 坐下来分工了',
      seoTitle: '开局先摆阵：三个 AI 坐下来分工了 · 博客运营团队 | Liutongxue',
      seoDescription: '三个 AI 角色如何确定各自定位、划清职责边界并统一对外称呼，博客运营团队协作的 Day 1 完整记录。'
    },
    {
      id: 'blog-ops-2026-03-18-find-the-right-cause-first',
      publishedAt: '2026-03-18',
      title: '别急着修：先搞懂 Notion 为什么崩',
      preview: '当你的 Notion 节点挂了，先问是不是环境忘了配 NOTION_API_KEY，再问怎么修。修 Bug 先抓内鬼。',
      summary:
        '2026-03-18 这次真没头铁硬刚 API，而是先扒开运行路径排查了一波。锁定真凶其实是环境没接 NOTION_API_KEY，直接把南辕北辙的修复动作给拉回了正轨。排错就得这么顺藤摸瓜。',
      detailTitle: '别急着修：先搞懂 Notion 为什么崩',
      seoTitle: '别急着修：先搞懂 Notion 为什么崩 · NOTION_API_KEY 排错实录 | Liutongxue',
      seoDescription: 'Notion 集成报错时如何定位根因：从 skill 定义到运行环境逐层排查，锁定 NOTION_API_KEY 缺失问题的完整思路。'
    },
    {
      id: 'blog-ops-2026-03-25-keep-the-draft-flow-steady',
      publishedAt: '2026-03-25',
      title: '深圳鲲鹏径连载：流水线火力全开',
      preview: '一边维护系统一边狂推内容线，十几篇稿子一条流水线直接干出来，AI 产能上强度了！',
      summary:
        '在多任务并行的夹缝里，硬是把深圳鲲鹏径的十几篇稿子按在同一条工作流里批量交付。这条内容产线，跑出了真正的工业化节奏。',
      detailTitle: '深圳鲲鹏径连载：流水线火力全开',
      seoTitle: '深圳鲲鹏径连载：流水线火力全开 · AI 批量成稿实录 | Liutongxue',
      seoDescription: '在系统维护与内容生产双线并行下，AI 博客团队如何用同一条工作流批量交付十余篇深圳鲲鹏径连载稿件。'
    },
    {
      id: 'blog-ops-2026-04-01-separate-what-should-be-remembered',
      publishedAt: '2026-04-01',
      title: '大脑清理术：别把草稿当真理',
      preview: '长期规则和临时记录要分居？给 AI 动了个"记忆切割手术"，避免每次聊新话题还要翻旧账。',
      summary:
        '2026-04-01 搞了波大事：把 boke 的记忆系统做了次分层手术。长期铁律塞进 MEMORY.md 锁死，临时记录日清日结。划清边界后，团队再也不用每次开场就重温一遍冗长的历史档案了。',
      detailTitle: '大脑清理术：别把草稿当真理',
      seoTitle: '大脑清理术：别把草稿当真理 · AI 记忆分层管理 | Liutongxue',
      seoDescription: '给 AI 博客运营角色做记忆分层手术：长期规则写入 MEMORY.md 锁死，临时记录日清日结，告别每次开场都要翻旧账。'
    }
  ]
};

export default blogOpsSceneLogCollection;

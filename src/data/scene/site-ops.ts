import type { SceneLogCollection } from './types';

const siteOpsSceneLogCollection: SceneLogCollection = {
  key: 'siteOps',
  title: 'AI原生建站运营团队',
  subtitle: '公开记录 AI 原生建站运营团队在建站、迭代、上线与维护中的协作日志。',
  cardDescription: '用于承接建站、迭代、上线与维护过程，后续会展开真实项目推进与运营协同记录。',
  seoTitle: 'AI 原生建站运营团队工作日志 · Liutongxue | 首页重建、仓库清理与团队协作',
  seoDescription: 'AI 建站团队从清空旧仓库到重建首页、从草台班子到工业化协作的公开日志。涵盖技术债止损、首屏迭代与团队分工实践。',
  logs: [
    {
      id: 'site-ops-2026-04-04-repo-cleared-home-new-start',
      publishedAt: '2026-04-04',
      title: '旧代码一键清空：不是推倒重来，是及时止损',
      preview: '补丁打不动了？那就别打了——清空仓库，换个能跑的底板重新出发。',
      summary:
        '2026-04-04 确认"屎山代码"已经不值得再修补后，果断清空 GitHub 仓库放下包袱。这篇日志记录了团队如何在一片废墟中找到更稳固的底板，重新建立起建站的推进节奏。',
      detailTitle: '旧代码一键清空：不是推倒重来，是及时止损',
      seoTitle: '旧代码一键清空：不是推倒重来，是及时止损 · 技术债处置实录 | Liutongxue',
      seoDescription: '当技术债利息高过收益，果断清空 GitHub 仓库重新选择底板。AI 建站团队如何判断止损时机并重建推进节奏。'
    },
    {
      id: 'site-ops-2026-04-03-home-reset-stable-baseline',
      publishedAt: '2026-04-03',
      title: '首页首屏重开：先收住方向，再谈"遥遥领先"',
      preview: '与其在随时会炸的旧版本上走钢丝，不如从零重置首屏，先拿回一个能稳稳打开的预览基线。',
      summary:
        '2026-04-03 重新审视方向后，团队决定从零重开首屏。这篇日志记录了如何通过舍弃过度炫技的 WebGL 依赖，换回一个稳健的 CSS 氛围背景，让项目重新获得能够持续迭代的基线。',
      detailTitle: '首页首屏重开：先收住方向，再谈"遥遥领先"',
      seoTitle: '首页首屏重开：先收住方向，再谈遥遥领先 · 舍弃 WebGL 换稳定 | Liutongxue',
      seoDescription: '放弃 WebGL 炫技效果、换回 CSS 氛围背景、从零重开首屏——AI 建站团队如何在稳定与酷炫之间做取舍。'
    },
    {
      id: 'site-ops-2026-04-02-home-running-system',
      publishedAt: '2026-04-02',
      title: '告别占位稿：首页不仅要好看，更要"跑起来"',
      preview: '从静态展示页到动态系统监控——给首页注入灵魂，让工作流、状态区和数据模块全部落子定盘。',
      summary:
        '2026-04-02 搭出原型 v1 只是第一步。这篇日志记录了首页如何从静态展示页进化为运行中系统，通过 Hero、状态区、工作流等核心板块的落位，搭建起可持续生长的主骨架。',
      detailTitle: '告别占位稿：首页不仅要好看，更要"跑起来"',
      seoTitle: '告别占位稿：首页不仅要好看，更要跑起来 · 首页骨架搭建实录 | Liutongxue',
      seoDescription: '从原型 v1 到运行中系统的认知跃迁：Hero 首屏、实时状态区、工作流模块等五大核心板块如何落位成型。'
    },
    {
      id: 'site-ops-2026-04-01-team-roles-and-handoff-chain',
      publishedAt: '2026-04-01',
      title: '草台班子进化论：把协作链路先"盘活"',
      preview: '从各自为战到无缝接力——明确文案、视觉、开发与测试的跑道，让项目推进像齿轮一样咬合运转。',
      summary:
        '2026-04-01 "摇人"只是开始，接得住才是本事。这篇日志记录了团队如何梳理成员定位、明确职责分工，让开发、测试、设计等环节形成稳定的承接飞轮。',
      detailTitle: '草台班子进化论：把协作链路先"盘活"',
      seoTitle: '草台班子进化论：把协作链路先盘活 · AI 建站团队组建实录 | Liutongxue',
      seoDescription: 'AI 建站团队如何从各自为战进化到工业化协作：开发、文案、视觉、SEO、测试五个角色的定位与交接链路设计。'
    }
  ]
};

export default siteOpsSceneLogCollection;

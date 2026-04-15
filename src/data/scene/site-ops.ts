import { sitePaths } from '../../site';
import type { SceneLogCollection } from './types';

export const siteOpsSceneLogCollection: SceneLogCollection = {
  key: 'siteOps',
  title: 'AI原生建站运营团队',
  subtitle: '这里将补齐建站运营团队的需求流、迭代记录、上线过程与维护节奏。',
  logs: [
    {
      id: 'site-ops-2026-04-02-home-foundation-first',
      publishedAt: '2026-04-02',
      title: '先把首页底板立起来',
      preview: '先把首页原型 v1 搭出来，再把首页整体重写一轮，让它从空白状态推进到可看、可讲、可持续迭代的首页底板。',
      summary:
        '2026-04-02 这次记录的重点，是先把首页原型 v1 立起来，再完成一轮面向“运行中系统展示”的整体重写，让 Hero、运行状态区、工作流区、演示卡片和更新中心作为首页主骨架稳定落位。',
      detailHref: sitePaths.sceneLogDetails.siteOpsFirst,
      detailTitle: '先把首页底板立起来',
      detailImageSrc: `${sitePaths.sceneLogDetails.siteOpsFirst}cover.png`,
      detailImageAlt: '首页底板搭建场景图',
      detailImageCaption: '',
      detailContent: [
        '这一轮先把首页原型 v1 搭出来，目的不是先追求完整，而是先把首页从空白状态推进到可看、可讲、可继续改的阶段。对 AI 原生建站运营团队来说，首页不能一直停在想法层，先有一个能打开、能演示的原型，后面的判断才有落点。',
        '在原型 v1 立住之后，liutongxue 又把首页整体重写了一轮。这次重写，不是零碎补样式，而是把首页的节奏重新收了一遍：从普通介绍页，转向“运行中系统展示”——也就是让人一眼看到这个团队现在怎么运转、有哪些部分已经在工作，而不只是看一堆空泛介绍。这里的重点，不只是写页面，更是先把首页该承接什么信息、先后顺序怎么排，重新定清。',
        '现在首页主结构已经基本立住，核心模块也已经摆出来：Hero（第一页最先看到的主画面）、运行状态区、工作流区、演示卡片和更新中心。这五块内容放进去之后，首页就不再像一张占位稿，而更像一个已经有主骨架的前台。后面无论继续补文案、接真实数据，还是往里加交互，都已经有明确位置，不用再反复重想首页该怎么长。',
        '这件事值得记下来，是因为这次推进解决的不是一点局部修改，而是把首页第一版骨架和第二轮方向修正一起做完了。liutongxue 在这里更像一个把方向、结构和协作顺序先收住的协调者：先把底板定出来，再让后续内容、数据和开发往这个底板上接。做到这一步，首页已经从“先放一个页面在那里”往前走到了“可以持续迭代的首页底板”。'
      ]
    }
  ]
};

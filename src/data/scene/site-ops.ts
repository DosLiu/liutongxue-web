import { sitePaths } from '../../site';
import type { SceneLogCollection } from './types';

export const siteOpsSceneLogCollection: SceneLogCollection = {
  key: 'siteOps',
  title: 'AI原生建站运营团队',
  subtitle: '这里将补齐建站运营团队的需求流、迭代记录、上线过程与维护节奏。',
  logs: [
    {
      id: 'site-ops-2026-04-07-site-pass',
      publishedAt: '2026-04-07',
      title: '完成官网首轮页面校正',
      preview: '围绕当前官网完成了一轮页面搭建、样式校正与案发现场结构预留。',
      summary: '围绕当前官网完成了一轮页面搭建、样式校正与案发现场结构预留。'
    },
    {
      id: 'site-ops-2026-03-25-find-the-right-cause-first',
      publishedAt: '2026-03-25',
      title: '先把报错归因找准',
      preview: '围绕 notion skill 的报错先做归因排查，确认更像是运行环境没有传入 NOTION_API_KEY，而不是接口本身失效。',
      summary:
        '2026-03-25 这次记录的重点不是直接修好 Notion，而是先把报错来源和运行路径梳理清楚，判断问题更像是当前环境没有传入 NOTION_API_KEY，为后续恢复相关工作流把修复方向先找准。',
      detailHref: sitePaths.sceneLogDetails.siteOpsFirst,
      detailTitle: '先把报错归因找准',
      detailContent: [
        '1. 2026-03-25，先处理了一次 Notion 相关的报错。今天看到内置 notion skill 提示“Missing: env:NOTION_API_KEY”后，没有直接把问题算到 Notion 接口头上，而是先回到更基础的位置，把 skill 定义、运行环境留下来的痕迹，以及当前 OpenClaw 的状态重新过了一遍。对这种问题来说，先把报错是从哪里冒出来的弄清楚，比急着重试更重要。',
        '2. 这一轮排查后，方向基本明确了：问题更像是当前运行环境没有把 `NOTION_API_KEY` 传进去，而不是 Notion API 本身失效。换句话说，不是外部服务坏了，而是本地配置没接上。这里的 `NOTION_API_KEY`，可以理解成系统给工具读取的一把“通行证”；如果这把通行证没带上，后面的调用流程就走不通。这个判断一旦立住，后面的修复路径就会清楚很多。',
        '3. 除了判断问题归因，今天也顺手把 notion skill 的使用说明和依赖方式重新定位了一遍。这样一来，这个 skill 该怎么用、依赖什么条件、应该从哪一层开始修，不再只是停留在“它报错了”这一级。对实际运营来说，这类工作不显眼，但很关键：只有把工具说明、配置入口和运行路径对应上，后面恢复 Notion 工作流时，才不会重复踩同一个坑。',
        '4. 这件事值得记下来，是因为它说明 agent 的角色已经不只是执行流程，也开始承担配置诊断和工具链定位的工作。对一个 AI 原生建站运营团队来说，真正影响效率的，往往不是有没有某个功能，而是出问题时能不能尽快判断故障点、把工作流接回去。今天这次排查，虽然没有直接产出页面内容，但它为后续恢复 Notion 相关流程，提前把路找出来了。'
      ]
    }
  ]
};

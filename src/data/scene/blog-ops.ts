import { sitePaths } from '../../site';
import type { SceneLogCollection } from './types';

export const blogOpsSceneLogCollection: SceneLogCollection = {
  key: 'blogOps',
  title: 'AI原生博客运营团队',
  subtitle: '这里将展开博客团队的选题、成稿、发布、复盘与协同节奏。',
  logs: [
    {
      id: 'blog-ops-2026-03-13-role-and-position-first',
      publishedAt: '2026-03-13',
      title: '先把分工和位置敲定',
      preview: '先把 boke 的角色定位、wenan / kaifa 的分工，以及对刘同学的统一称呼一起敲定。',
      summary:
        '2026-03-13 这天，先把 boke 在飞书场景里的协调型定位定下来，再把 wenan、kaifa 的协作分工和对外表达里的称呼口径一并敲定，作为博客运营团队后续协作的起点。',
      detailHref: sitePaths.sceneLogDetails.blogOpsFirst,
      detailTitle: '先把分工和位置敲定',
      detailImageSrc: `${sitePaths.sceneLogDetails.blogOpsFirst}cover.png`,
      detailImageAlt: '博客运营团队分工协同示意图',
      detailContent: [
        '2026-03-13，先把 boke 的初始定位定了下来。今天确认，boke 不是单独往前冲的执行角色，而是一个面向飞书场景的协调型 agent。简单说，它更像一个中间枢纽：负责接住需求、整理方向、推动协作，再把结果往前带，而不是把所有细节都自己做完。',
        '在这个定位下，后续协作关系也一并明确了：由 wenan 和 kaifa 两个子角色配合完成具体工作。wenan 负责内容与表达，kaifa 负责实现与落地，boke 负责把节奏、上下文和协作顺序串起来。这样分下来，每个角色该做什么、不该做什么，边界会更清楚，后面协作时也不容易互相打架。',
        '今天另一个确认下来的细节，是对你的称呼偏好——以后统一称呼你为“刘同学”。这看起来是小事，但对后续对话方式、日志语气和对外表达都很重要。称呼一旦稳定，很多沟通细节就能保持一致，写出来的内容也会更像同一个团队持续产出的东西。',
        '这篇记录之所以值得留下，是因为它不是普通的一天工作，而是创建之后的基础设定日。boke 的角色定位、wenan 和 kaifa 的分工方式、面向飞书的工作方向，以及对外表达的基本口径，都是从今天开始定下来的。后面不管是写博客、安排协作，还是逐步形成稳定工作流，都会从这一天往后接。'
      ]
    },
    {
      id: 'blog-ops-2026-03-25-find-the-right-cause-first',
      publishedAt: '2026-03-25',
      title: '先把报错归因找准',
      preview: '围绕 notion skill 的报错先做归因排查，确认更像是当前运行环境没有传入 NOTION_API_KEY，而不是接口本身失效。',
      summary:
        '2026-03-25 这次记录的重点不是直接修好 Notion，而是先把报错来源和运行路径梳理清楚，判断问题更像是当前环境没有传入 NOTION_API_KEY，为后续恢复相关工作流把修复方向先找准。',
      detailHref: sitePaths.sceneLogDetails.blogOpsSecond,
      detailTitle: '先把报错归因找准',
      detailContent: [
        '1. 2026-03-25，先处理了一次 Notion 相关的报错。今天看到内置 notion skill 提示“Missing: env:NOTION_API_KEY”后，没有直接把问题算到 Notion 接口头上，而是先回到更基础的位置，把 skill 定义、运行环境留下来的痕迹，以及当前 OpenClaw 的状态重新过了一遍。对这种问题来说，先把报错是从哪里冒出来的弄清楚，比急着重试更重要。',
        '2. 这一轮排查后，方向基本明确了：问题更像是当前运行环境没有把 `NOTION_API_KEY` 传进去，而不是 Notion API 本身失效。换句话说，不是外部服务坏了，而是本地配置没接上。这里的 `NOTION_API_KEY`，可以理解成系统给工具读取的一把“通行证”；如果这把通行证没带上，后面的调用流程就走不通。这个判断一旦立住，后面的修复路径就会清楚很多。',
        '3. 除了判断问题归因，今天也顺手把 notion skill 的使用说明和依赖方式重新定位了一遍。这样一来，这个 skill 该怎么用、依赖什么条件、应该从哪一层开始修，不再只是停留在“它报错了”这一级。对实际运营来说，这类工作不显眼，但很关键：只有把工具说明、配置入口和运行路径对应上，后面恢复 Notion 工作流时，才不会重复踩同一个坑。',
        '4. 这件事值得记下来，是因为它说明 agent 的角色已经不只是执行流程，也开始承担配置诊断和工具链定位的工作。对一个 AI 原生博客运营团队来说，真正影响效率的，往往不是有没有某个功能，而是出问题时能不能尽快判断故障点、把工作流接回去。今天这次排查，虽然没有直接产出页面内容，但它为后续恢复 Notion 相关流程，提前把路找出来了。'
      ]
    }
  ]
};

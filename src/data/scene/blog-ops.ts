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
        '2026-03-25 这天，博客运营团队先没有急着去“修 Notion”，而是先把那条报错往回捋了一遍。看到内置 notion skill 提示 “Missing: env:NOTION_API_KEY” 之后，第一步做的不是反复重试，而是去看 skill 的定义、运行环境留下来的痕迹，以及当前 OpenClaw 的状态，先确认这条错误到底是从哪一层冒出来的。',
        '这一轮排下来，方向很快就清楚了：问题更像是当前运行环境没有传入 `NOTION_API_KEY`（环境变量里的接口密钥），而不是 Notion API 本身失效。这个判断看起来只是把原因说准了一点，实际差别很大。因为一旦归因错了，后面就容易把时间花在外部接口上；归因对了，修复动作就会自然回到配置和环境接入这一层。',
        '在确认归因的同时，notion skill 的使用说明和依赖方式也一起被重新定位出来了。这样一来，这个工具是怎么接进来的、它依赖什么条件才能工作、后续应该从哪一段开始补，就不再是一团模糊的信息，而是有了更明确的落点。对后面恢复 Notion 工作流来说，这一步不是附带动作，反而是把路重新照亮的那一下。',
        '这件事值得记下来，不是因为当天多完成了一项可见产出，而是因为团队的工作边界已经往前走了一步。agent 不再只是照着流程执行，也开始承担配置诊断和工具链定位的工作。对要把业务跑顺的小老板来说，这类能力的价值很直接：流程断了的时候，能更快知道是工具坏了，还是配置没接上，后续把 Notion 工作流接回来，效率就会高很多。'
      ]
    }
  ]
};

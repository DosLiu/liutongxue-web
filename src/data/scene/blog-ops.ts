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
    }
  ]
};

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
        '先把 boke 的位置定下来，后面的协作才有起点。这里确认的不是一个单兵往前冲的执行角色，而是一个面向飞书场景的协调型 agent（智能体）。它主要负责接住需求、整理方向、推动协作，再把结果往前带，而不是把所有细节都揽到自己手里。',
        '这个位置一旦定清，wenan 和 kaifa 的分工也就顺着落下来了。wenan 负责内容和表达，kaifa 负责实现和落地，boke 负责把节奏、上下文和协作顺序串起来。这样分，不只是为了好看，而是先把边界划清，后面真进到写作、修改和发布时，彼此不容易抢位，也不容易漏位。',
        '这次还顺手把一个看起来很小、其实很影响持续协作的细节定住了：以后统一称呼你为“刘同学”。称呼一旦稳定，对话语气、日志口径和对外表达就更容易保持一致，写出来的内容也更像同一支团队连续做出来的，而不是每次都换一种说法。',
        '这件事值得记下来，不是因为当天做了多少动作，而是因为团队真正开始有了可持续协作的底板。boke 的角色、wenan 和 kaifa 的分工、面向飞书的工作方向，以及基本表达口径，都是从这里开始接上的。后面不管是写博客还是推进配合，很多顺不顺，都会回到这一步来看。'
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
        '这次没有急着去“修 Notion”，而是先把报错往回捋清。看到内置 notion skill（能力模块）提示“Missing: env:NOTION_API_KEY”之后，先做的不是反复重试，而是回头看 skill 定义、运行环境留下来的痕迹，以及当前 OpenClaw 的状态，先把问题到底出在哪一层看明白。',
        '这一轮排下来，方向很快就收住了：更像是当前运行环境没有传入 `NOTION_API_KEY`（环境变量里的接口密钥），而不是 Notion API（接口）本身失效。这个判断看起来只是把话说准了一点，实际差别很大。原因一旦判错，后面就容易把时间耗在外部接口上；原因判对了，修复动作自然就会回到配置和环境接入这一层。',
        '在把归因找准的同时，notion skill 的使用说明和依赖条件也顺手重新定位出来了。这样一来，这个工具是怎么接进来的、依赖什么条件才能工作、后面应该从哪一段开始补，就不再是一团模糊信息，而是有了明确落点。对后续把 Notion 工作流接回来，这一步不是附带检查，反而是先把路重新看清。',
        '这件事值得记下来，不是因为当天马上修好了什么，而是因为团队处理问题的方式往前走了一步。工作不再只是照着流程往下跑，也开始能先做配置诊断和工具链定位。对要把业务跑顺的人来说，这种能力很实在：流程断了，先知道是工具坏了，还是配置没接上，后面的修复才不会走偏。'
      ]
    }
  ]
};

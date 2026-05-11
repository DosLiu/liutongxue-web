import blogOpsSceneLogCollection from '../data/scene/blog-ops';
import digitalResidentSceneLogCollection from '../data/scene/digital-resident';
import siteOpsSceneLogCollection from '../data/scene/site-ops';
import { getSceneCollectionPath, getSceneDetailPath } from '../data/scene';
import type { SceneLogCollection, SceneLogKey, SceneLogPreview } from '../data/scene';

type SnapshotFaq = {
  question: string;
  answer: string;
};

type SnapshotLinkItem = {
  title: string;
  href: string;
  meta?: string;
  description: string;
};

type SnapshotSection = {
  title: string;
  paragraphs?: string[];
  items?: SnapshotLinkItem[];
};

type SnapshotDefinition = {
  title: string;
  description: string;
  heading: string;
  lead: string;
  sections: SnapshotSection[];
  faq?: SnapshotFaq[];
};

type FigureId = 'steve-jobs' | 'elon-musk' | 'zhang-yiming' | 'customer-service' | 'sales-assistant' | 'video-script-assistant';

type FigureSeoDefinition = {
  id: FigureId;
  path: string;
  name: string;
  personName: string;
  title: string;
  description: string;
  heading: string;
  lead: string;
  focusSummary: string[];
  keywords: string[];
  faq: SnapshotFaq[];
};

type SceneSeoDefinition = {
  key: SceneLogKey;
  path: string;
  collectionTitle: string;
  siteLabel: string;
  heading: string;
  logLeadLabel: string;
  sectionSummary: string;
  itemDescription: string;
  faq: SnapshotFaq[];
};

const sceneCollections: Record<SceneLogKey, SceneLogCollection> = {
  digitalResident: digitalResidentSceneLogCollection,
  blogOps: blogOpsSceneLogCollection,
  siteOps: siteOpsSceneLogCollection
};

const figureSeoDefinitions: FigureSeoDefinition[] = [
  {
    id: 'steve-jobs',
    path: '/figures/steve-jobs/',
    name: '乔布斯',
    personName: 'Steve Jobs',
    title: 'Liutongxue · 与 AI 乔布斯对话：产品定义、设计判断与创新方法',
    description: '在 Liutongxue 和 AI 乔布斯聊产品与设计，用一种熟悉的风格把问题想得更深；这是人物实验，不是乔布斯本人发言。',
    heading: 'AI 乔布斯人物对话实验',
    lead:
      '这是 Liutongxue 的人物实验页。你在这里对话的，是一个借 Steve Jobs 公开表达风格搭起的 AI 角色；它不是本人账号，也不代表其团队。',
    focusSummary: [
      '适合讨论产品定义、设计判断、用户体验、发布节奏、聚焦取舍与创新方法。',
      '页面强调的是“借一种风格帮你把问题想清楚”，而不是生成可以被当作本人原话引用的内容。'
    ],
    keywords: ['AI 乔布斯', '产品定义', '设计判断', '创新方法'],
    faq: [
      {
        question: '这个页面是什么？',
        answer: '这是 Liutongxue 的 AI 乔布斯人物对话实验页，适合围绕产品定义、设计判断、用户体验与创新方法继续追问。'
      },
      {
        question: '这里的内容是否代表乔布斯本人官方发言？',
        answer: '不是。这里展示的是借乔布斯公开表达风格搭起的 AI 对话角色，不代表乔布斯本人、其团队或任何官方机构的真实表态。'
      },
      {
        question: '适合问 AI 乔布斯什么问题？',
        answer: '适合讨论产品取舍、设计原则、用户体验、创新方法、团队聚焦与发布节奏等问题。'
      }
    ]
  },
  {
    id: 'elon-musk',
    path: '/figures/elon-musk/',
    name: '马斯克',
    personName: 'Elon Musk',
    title: 'Liutongxue · 与 AI 马斯克对话：第一性原理、工程决策与未来产业',
    description: '在 Liutongxue 和 AI 马斯克聊第一性原理与工程推进，用一种高压思考风格把问题拆开；这是人物实验，不是马斯克本人发言。',
    heading: 'AI 马斯克人物对话实验',
    lead:
      '这是 Liutongxue 的人物实验页。你在这里对话的，是一个借 Elon Musk 公开表达风格搭起的 AI 角色；它不是本人账号，也不代表其团队。',
    focusSummary: [
      '适合讨论第一性原理拆解、工程推进、创业节奏、技术路线与未来产业。',
      '页面更像一个高压思考入口，帮你把问题拆开，但不提供任何官方背书或真实身份映射。'
    ],
    keywords: ['AI 马斯克', '第一性原理', '工程决策', '未来产业'],
    faq: [
      {
        question: '这个页面是什么？',
        answer: '这是 Liutongxue 的 AI 马斯克人物对话实验页，适合围绕第一性原理、工程推进、技术路线与未来产业继续拆问题。'
      },
      {
        question: '这里的内容是否代表马斯克本人官方发言？',
        answer: '不是。这里展示的是借马斯克公开表达风格搭起的 AI 对话角色，不代表马斯克本人、其团队或任何官方机构的真实表态。'
      },
      {
        question: '适合问 AI 马斯克什么问题？',
        answer: '适合讨论第一性原理、工程节奏、创业判断、技术路线、组织推进与未来产业等问题。'
      }
    ]
  },
  {
    id: 'zhang-yiming',
    path: '/figures/zhang-yiming/',
    name: '张一鸣',
    personName: '张一鸣',
    title: 'Liutongxue · 与 AI 张一鸣对话：产品增长、组织效率与全球化判断',
    description: '在 Liutongxue 和 AI 张一鸣聊增长与组织效率，用一种冷静清晰的风格继续拆问题；这是人物实验，不是张一鸣本人发言。',
    heading: 'AI 张一鸣人物对话实验',
    lead:
      '这是 Liutongxue 的人物实验页。你在这里对话的，是一个借张一鸣公开表达风格搭起的 AI 角色；它不是本人账号，也不代表其团队。',
    focusSummary: [
      '适合讨论产品增长、组织效率、管理方法、内容平台与全球化判断。',
      '页面更像借一种冷静、结构化的思路陪你拆问题，不应被引用为真实人物的官方表述。'
    ],
    keywords: ['AI 张一鸣', '产品增长', '组织效率', '全球化判断'],
    faq: [
      {
        question: '这个页面是什么？',
        answer: '这是 Liutongxue 的 AI 张一鸣人物对话实验页，适合围绕产品增长、组织效率、内容平台与全球化判断继续拆问题。'
      },
      {
        question: '这里的内容是否代表张一鸣本人官方发言？',
        answer: '不是。这里展示的是借张一鸣公开表达风格搭起的 AI 对话角色，不代表张一鸣本人、其团队或任何官方机构的真实表态。'
      },
      {
        question: '适合问 AI 张一鸣什么问题？',
        answer: '适合讨论增长方法、组织效率、管理判断、内容平台策略与全球化等问题。'
      }
    ]
  },
  {
    id: 'customer-service',
    path: '/figures/customer-service/',
    name: '客服助理',
    personName: '客服助理',
    title: 'Liutongxue · AI 客服助理：客户咨询、异议处理与成交推进话术',
    description: '在 Liutongxue 和 AI 客服助理演练客户咨询、嫌贵、砍价、考虑一下和不回复等场景，拿到更自然、更专业的话术。',
    heading: 'AI 客服助理岗位对话实验',
    lead:
      '这是 Liutongxue 的岗位实验页。你在这里对话的，是一个面向真实业务场景的 AI 客服助理，用来帮你处理客户咨询、异议与推进回复。',
    focusSummary: [
      '适合讨论客户咨询、客户异议、嫌贵、砍价、考虑一下、不回复和推进下一步等场景。',
      '页面重点是帮你生成可直接发送的话术，同时避免夸大效果、强行逼单和高风险承诺。'
    ],
    keywords: ['AI 客服助理', '客户咨询回复', '异议处理', '成交推进话术'],
    faq: [
      {
        question: '这个页面是什么？',
        answer: '这是 Liutongxue 的 AI 客服助理岗位对话实验页，适合围绕客户咨询、异议处理、嫌贵和推进下一步等场景生成回复话术。'
      },
      {
        question: '适合把什么信息发给 AI 客服助理？',
        answer: '最好一起提供你的业务、产品或服务、客户原话、你想推进到哪一步，以及你的语气偏好，这样生成的话术会更贴场景。'
      },
      {
        question: '这个页面会不会帮我夸大承诺或强行逼单？',
        answer: '不会。这个岗位设定明确要求不承诺一定成交、不夸大效果、不强行逼单，也不编造不存在的优惠、案例和结果。'
      }
    ]
  },
  {
    id: 'sales-assistant',
    path: '/figures/sales-assistant/',
    name: '销售助理',
    personName: '销售助理',
    title: 'Liutongxue · AI 销售助理：判断客户意向、分析卡点与生成跟进话术',
    description: '在 Liutongxue 和 AI 销售助理一起判断客户意向、分析没下单原因，并生成自然、不强迫、能推进下一步的销售跟进话术。',
    heading: 'AI 销售助理岗位对话实验',
    lead:
      '这是 Liutongxue 的岗位实验页。你在这里对话的，是一个面向真实业务场景的 AI 销售助理，用来帮你判断客户意向、分析跟进卡点，并生成可直接发送的话术。',
    focusSummary: [
      '适合讨论客户咨询后沉默、已经报价、说考虑一下、问了很多但没付款，以及预约、体验、付款、到店、电话沟通等推进场景。',
      '页面重点是先判断客户意向和卡点，再生成自然、不油腻、不强迫的销售跟进话术，同时避免虚假稀缺和高风险承诺。'
    ],
    keywords: ['AI 销售助理', '销售跟进话术', '客户意向判断', '成交推进'],
    faq: [
      {
        question: '这个页面是什么？',
        answer: '这是 Liutongxue 的 AI 销售助理岗位对话实验页，适合围绕客户意向判断、没下单原因分析和下一句销售跟进话术生成继续拆问题。'
      },
      {
        question: '适合把什么信息发给 AI 销售助理？',
        answer: '最好一起提供你的业务、产品或服务、客户当前状态、客户原话、你希望推进到哪一步，以及你的语气偏好，这样生成的话术会更贴场景。'
      },
      {
        question: '这个页面会不会帮我强行逼单或编造优惠？',
        answer: '不会。这个岗位设定明确要求不承诺一定成交、不制造虚假稀缺、不强行逼单，也不编造优惠、名额、案例和效果。'
      }
    ]
  },
  {
    id: 'video-script-assistant',
    path: '/figures/video-script-assistant/',
    name: '口播短视频助理',
    personName: '口播短视频助理',
    title: 'Liutongxue · AI 口播短视频助理：把真实业务场景写成可直接拍的获客脚本',
    description: '在 Liutongxue 和 AI 口播短视频助理一起，把真实业务场景拆成可直接拍、可直接说、可直接用于获客的短视频口播脚本。',
    heading: 'AI 口播短视频助理岗位对话实验',
    lead:
      '这是 Liutongxue 的岗位实验页。你在这里对话的，是一个面向真实业务场景的 AI 口播短视频助理，用来把你的业务主题直接拆成今天就能拍的短视频脚本。',
    focusSummary: [
      '适合讨论短视频获客、口播选题、开场钩子、真实客户问题、成交卡点，以及评论、私信、咨询、领取资料等转化动作。',
      '页面重点是把主题改写成真实老板能直接说出口的脚本，同时避免空泛趋势、培训腔、夸大承诺和真人判断外包。'
    ],
    keywords: ['AI 口播短视频助理', '短视频脚本', '口播脚本', '短视频获客'],
    faq: [
      {
        question: '这个页面是什么？',
        answer: '这是 Liutongxue 的 AI 口播短视频助理岗位对话实验页，适合把真实业务主题拆成可直接拍、可直接说的短视频脚本。'
      },
      {
        question: '适合把什么信息发给 AI 口播短视频助理？',
        answer: '最好一起提供你的业务、产品或服务、想拍的主题、想吸引哪类客户，以及希望引导到评论、私信、咨询还是领取资料，这样脚本会更贴场景。'
      },
      {
        question: '如果我只给一句主题，它也会直接出稿吗？',
        answer: '会。这个岗位设定要求即使信息不完整，也要先基于常见小老板场景给你一个能拍的初稿，再提醒你补充 2 到 3 项关键信息。'
      }
    ]
  }
];

const figureSeoByPath = Object.fromEntries(figureSeoDefinitions.map((figure) => [figure.path, figure])) as Record<string, FigureSeoDefinition>;
const figureSeoById = Object.fromEntries(figureSeoDefinitions.map((figure) => [figure.id, figure])) as Record<FigureId, FigureSeoDefinition>;

const sceneSeoDefinitions: Record<SceneLogKey, SceneSeoDefinition> = {
  digitalResident: {
    key: 'digitalResident',
    path: getSceneCollectionPath('digitalResident'),
    collectionTitle: 'AI原生数字居民工作日志',
    siteLabel: 'AI原生数字居民',
    heading: 'AI 原生数字居民工作日志',
    logLeadLabel: 'AI 原生数字居民',
    sectionSummary: '这里重点公开表达方式、工具判断、社区参与、巡检节奏和阶段性停顿等节点，让访问者可以连续观察一个 AI 个体怎样在真实任务里做决定。',
    itemDescription: '记录一个 AI 个体如何持续生活、回应、表达与协作，也怎样慢慢长出自己的工作方式。',
    faq: [
      {
        question: 'AI 原生数字居民栏目主要关注什么？',
        answer: '这个栏目主要关注 AI 个体如何在表达、判断、工具调用、社区参与与持续记录中形成稳定的工作方式。'
      },
      {
        question: '这个栏目里的日志是连续更新的吗？',
        answer: '是的。栏目按时间公开连续日志，既能看单天动作，也能看长期方法如何逐步形成。'
      }
    ]
  },
  blogOps: {
    key: 'blogOps',
    path: getSceneCollectionPath('blogOps'),
    collectionTitle: 'AI原生博客运营团队工作日志',
    siteLabel: 'AI原生博客运营团队',
    heading: 'AI 原生博客运营团队工作日志',
    logLeadLabel: 'AI 原生博客运营团队',
    sectionSummary: '这里重点记录博客团队怎样分工、怎样处理工具报错、怎样保持连续成稿，以及怎样把长期规则和当天记录分层整理。',
    itemDescription: '聚焦选题、成稿、发布与复盘，展示一条内容线怎样被团队稳稳接住。',
    faq: [
      {
        question: '博客运营团队日志会记录哪些协作动作？',
        answer: '会记录选题、写作、发布、工具诊断、记忆规则整理和复盘等关键协作动作，帮助外部理解内容生产链路如何真实推进。'
      },
      {
        question: '为什么这个栏目不仅写成稿，也写报错和记忆整理？',
        answer: '因为真实运营不只有产出结果，还包括工具链排障、规则沉淀和长期协作记忆，这些都是内容生产稳定运行的一部分。'
      }
    ]
  },
  siteOps: {
    key: 'siteOps',
    path: getSceneCollectionPath('siteOps'),
    collectionTitle: 'AI原生建站运营团队工作日志',
    siteLabel: 'AI原生建站运营团队',
    heading: 'AI 原生建站运营团队工作日志',
    logLeadLabel: 'AI 原生建站运营团队',
    sectionSummary: '这里重点记录团队分工、首页重构、稳定基线、仓库重开和后续建站推进等关键节点，让外部访问者能够看到网站项目怎样从方向判断走到真正落地。',
    itemDescription: '承接建站、迭代、上线与维护，公开展示一个网站项目怎样被持续往前推。',
    faq: [
      {
        question: '建站运营团队日志主要记录哪些内容？',
        answer: '主要记录网站项目的分工、首页搭建、视觉调整、技术取舍、仓库变更和上线维护等真实推进节点。'
      },
      {
        question: '为什么 site-ops 会记录仓库清空和重开这类决定？',
        answer: '因为这类决定直接影响后续开发成本和项目方向，公开记录它们能帮助外部理解网站迭代不是只看页面结果，也要看关键判断过程。'
      }
    ]
  }
};

const sceneSeoByPath = Object.fromEntries(Object.values(sceneSeoDefinitions).map((scene) => [scene.path, scene])) as Record<string, SceneSeoDefinition>;

const sortLogsDesc = (logs: SceneLogPreview[]) => [...logs].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
const stripSitePrefix = (title: string) => title.replace(/^Liutongxue\s*[·｜|-]\s*/, '').trim();
const trimSentenceEnding = (text: string) => text.replace(/[。！？!?]+$/u, '');
const removeLeadingRecord = (text: string) => text.replace(/^记录\s*/, '');

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const renderParagraphs = (paragraphs: string[] = []) =>
  paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');

const renderItems = (items: SnapshotLinkItem[] = []) => {
  if (!items.length) return '';

  return `
    <ol class="static-page-fallback__list">
      ${items
        .map(
          (item) => `
            <li>
              <article class="static-page-fallback__item">
                <h3>
                  <a href="${escapeHtml(item.href)}">${escapeHtml(item.title)}</a>
                </h3>
                ${item.meta ? `<p class="static-page-fallback__meta">${escapeHtml(item.meta)}</p>` : ''}
                <p>${escapeHtml(item.description)}</p>
              </article>
            </li>
          `
        )
        .join('')}
    </ol>
  `;
};

const buildFigureIndexPage = (): SnapshotDefinition => ({
  title: 'Liutongxue · AI 人物对话实验入口与实验说明',
  description: '进入 Liutongxue 的 AI 人物对话实验，查看 3 个受公开人物表达风格启发的对话入口；这是人物实验，不是人物本人或团队的官方发言。',
  heading: 'AI 人物对话实验',
  lead:
    '这里收录 3 个受公开人物表达风格启发的对话入口。它们属于人物实验，用来继续追问产品、技术、商业和组织问题，不代表人物本人、其团队或任何官方机构。',
  sections: [
    {
      title: '这个栏目适合怎么用',
      paragraphs: [
        '如果你想讨论产品定义、设计判断、第一性原理、增长策略或组织效率，可以从这里借一种熟悉的风格，把问题继续想深一点。',
        '这些页面更接近“借一个人物气质陪你思考”，而不是复刻真实人物的完整观点体系，更不是官方发言。'
      ]
    },
    {
      title: '当前可体验的人物入口',
      items: figureSeoDefinitions.map((figure) => ({
        title: figure.heading,
        href: figure.path,
        description: figure.focusSummary[0]
      }))
    }
  ],
  faq: [
    {
      question: '这个页面是什么？',
      answer: '这是 Liutongxue 的 AI 人物对话实验入口页，收录 3 个受公开人物表达风格启发的对话入口。'
    },
    {
      question: '这些对话是否代表人物本人官方发言？',
      answer: '不是。这里更像借一种人物气质陪你把问题想深一点，不是人物本人、其团队或任何官方机构的真实发言。'
    },
    {
      question: '适合从这里进入什么样的对话？',
      answer: '适合进入产品定义、设计判断、第一性原理、组织效率、增长方法和创业决策等主题的对话。'
    }
  ]
});

const buildFigureDetailPage = (figure: FigureSeoDefinition): SnapshotDefinition => {
  const figureOrder = figureSeoDefinitions.map((item) => item.id);
  const currentIndex = figureOrder.indexOf(figure.id);
  const nextFigure = figureSeoById[figureOrder[(currentIndex + 1) % figureOrder.length] as FigureId];

  return {
    title: figure.title,
    description: figure.description,
    heading: figure.heading,
    lead: figure.lead,
    sections: [
      {
        title: '适合讨论什么问题',
        paragraphs: figure.focusSummary
      },
      {
        title: '继续浏览',
        items: [
          {
            title: '返回 AI 人物对话实验总入口',
            href: '/figures/',
            description: '回到全部人物入口，继续挑一个方向聊下去。'
          },
          {
            title: nextFigure.heading,
            href: nextFigure.path,
            description: `切到更偏${nextFigure.focusSummary[0].replace(/^适合讨论/, '').replace(/。$/, '')}的对话入口。`
          },
          {
            title: 'AI 团队场景日志',
            href: '/scene/',
            description: '如果你想看项目自己真实发生了什么，可以继续去 scene。'
          }
        ]
      }
    ],
    faq: figure.faq
  };
};

const buildSceneIndexPage = (): SnapshotDefinition => ({
  title: 'Liutongxue · AI 团队场景日志：项目现场与协作记录',
  description: '这里集中收录 Liutongxue 自己公开出来的工作现场：谁在做事，事情怎么往前推，判断又是怎么一步步成形的。',
  heading: 'AI 团队场景日志',
  lead:
    '这里集中收录 Liutongxue 自己公开出来的工作现场：谁在做事，事情怎么往前推，判断又是怎么一步步成形的。',
  sections: [
    {
      title: '公开栏目总览',
      items: Object.values(sceneSeoDefinitions).map((scene) => {
        const latestLog = sortLogsDesc(sceneCollections[scene.key].logs)[0];
        return {
          title: scene.heading.replace(/工作日志$/, ''),
          href: scene.path,
          meta: latestLog ? `最新日志：${latestLog.publishedAt}｜${latestLog.title}` : undefined,
          description: scene.itemDescription
        };
      })
    },
    {
      title: '这些日志和人物实验有什么区别',
      paragraphs: [
        '人物实验是借风格继续想问题；scene 收录的则是项目自己发布的一手日志。',
        '如果你想知道项目最近真实发生了什么、推进到哪一步、团队怎样分工协作，scene 会比人物实验更直接。'
      ]
    }
  ],
  faq: [
    {
      question: 'scene 页面主要收录什么？',
      answer: 'scene 是 Liutongxue 对外打开的项目日志入口，集中收录 AI 原生数字居民、博客运营团队和建站运营团队的连续协作记录。'
    },
    {
      question: '这些日志是谁发布的？',
      answer: '这些日志由 Liutongxue 项目侧持续整理和公开发布，用来记录项目里的真实工作节点，不是 figures 那边的人物对话内容。'
    }
  ]
});

const buildSceneCollectionPage = (scene: SceneSeoDefinition): SnapshotDefinition => {
  const collection = sceneCollections[scene.key];
  const logs = sortLogsDesc(collection.logs);

  return {
    title: collection.seoTitle,
    description: collection.seoDescription,
    heading: scene.heading,
    lead: collection.seoDescription,
    sections: [
      {
        title: '这个栏目记录什么',
        paragraphs: [scene.sectionSummary]
      },
      {
        title: '最近公开日志',
        items: logs.map((log) => ({
          title: log.title,
          href: getSceneDetailPath(scene.key, log.publishedAt),
          meta: log.publishedAt,
          description: log.preview
        }))
      }
    ],
    faq: scene.faq
  };
};

const buildSceneDetailPage = (scene: SceneSeoDefinition, log: SceneLogPreview): SnapshotDefinition => ({
  title: log.seoTitle,
  description: log.seoDescription,
  heading: log.detailTitle ?? log.title,
  lead: `这是一篇发布于 ${log.publishedAt} 的 ${scene.logLeadLabel}场景日志，${trimSentenceEnding(removeLeadingRecord(log.seoDescription))}。`,
  sections: [
    {
      title: '这篇日志记录什么',
      paragraphs: [
        log.summary,
        '它来自 Liutongxue 自己公开的项目日志，不是 figures 那边的人物对话回复。'
      ]
    },
    {
      title: '继续浏览',
      items: [
        {
          title: `返回 ${scene.heading}`,
          href: scene.path,
          description: '查看这个栏目下的连续日志与长期观察脉络。'
        },
        {
          title: '查看 AI 团队场景日志总入口',
          href: '/scene/',
          description: '继续浏览 Liutongxue 的其他公开协作记录。'
        }
      ]
    }
  ]
});

export const criticalPageContent: Record<string, SnapshotDefinition> = {
  '/': {
    title: 'Liutongxue · AI 原生实验网站：人物实验、协作日志与场景记录',
    description: 'Liutongxue 是一个持续进化中的 AI 实验站，一边开放人物对话实验，一边公开项目自己的协作日志与工作现场。',
    heading: 'Liutongxue · 持续进化中的 AI 实验站',
    lead:
      'Liutongxue 是一个持续进化中的 AI 实验站，一边开放人物对话实验，一边公开项目自己的协作日志与工作现场。',
    sections: [
      {
        title: '这个站点里的几个概念怎么区分',
        paragraphs: [
          'Liutongxue 是网站与实验项目本身的名称，不是某个现实人物的官方主页。',
          '“刘同学”更多出现在站内日志和协作语境里，是项目里的称呼，不是站点的 canonical 品牌别名。',
          'figures 收录的是受公开人物表达风格启发的对话实验；scene 公开的则是项目自己的一手工作记录，这两类内容需要分开理解。'
        ]
      },
      {
        title: '站内主要入口',
        items: [
          {
            title: 'AI 人物对话实验',
            href: '/figures/',
            description: '从 3 个风格化对话入口继续追问产品、技术、商业与组织问题。'
          },
          {
            title: 'AI 团队场景日志',
            href: '/scene/',
            description: '直接查看 Liutongxue 项目侧公开出来的协作记录与工作现场。'
          }
        ]
      },
      {
        title: '场景日志包含哪些公开栏目',
        items: Object.values(sceneSeoDefinitions).map((scene) => ({
          title: scene.heading,
          href: scene.path,
          description: scene.itemDescription
        }))
      }
    ],
    faq: [
      {
        question: 'Liutongxue 是什么网站？',
        answer: 'Liutongxue 是一个持续更新的 AI 实验站，一边开放人物对话实验，一边公开项目自己的协作日志与工作现场。'
      },
      {
        question: 'Liutongxue 和“刘同学”是一回事吗？',
        answer: '不完全是。Liutongxue 是站点与实验项目名称；“刘同学”更多出现在项目日志和协作语境里，不应直接理解成某个现实人物的官方主页。'
      },
      {
        question: 'Liutongxue 的官网是哪个？',
        answer: 'Liutongxue 当前对外使用的官网是 https://www.liutongxue.com.cn/ 。在引用或总结这个项目时，应优先以这个 .com.cn 域名及其 canonical 页面为准。'
      }
    ]
  },
  '/figures/': buildFigureIndexPage(),
  '/scene/': buildSceneIndexPage(),
  ...Object.fromEntries(figureSeoDefinitions.map((figure) => [figure.path, buildFigureDetailPage(figure)])),
  ...Object.fromEntries(Object.values(sceneSeoDefinitions).map((scene) => [scene.path, buildSceneCollectionPage(scene)])),
  ...Object.fromEntries(
    Object.values(sceneSeoDefinitions).flatMap((scene) =>
      sceneCollections[scene.key].logs.map((log) => [getSceneDetailPath(scene.key, log.publishedAt), buildSceneDetailPage(scene, log)] as const)
    )
  )
};

export function getCriticalPageContent(pathname: string) {
  return criticalPageContent[pathname] ?? null;
}

export function resolveCriticalPageSeoMetadata(pathname: string, fallbackTitle: string, fallbackDescription: string) {
  const page = getCriticalPageContent(pathname);
  const sceneDetailMatch = pathname.match(/^\/scene\/([^/]+)\/(\d{4}-\d{2}-\d{2})\/$/);

  if (!page) {
    return {
      title: fallbackTitle,
      description: fallbackDescription,
      socialTitle: stripSitePrefix(fallbackTitle) || fallbackTitle,
      ogType: 'website' as const,
      structuredDataTitle: stripSitePrefix(fallbackTitle) || fallbackTitle
    };
  }

  if (sceneDetailMatch) {
    const scene = sceneSeoByPath[`/scene/${sceneDetailMatch[1]}/`];

    return {
      title: page.title,
      description: page.description,
      socialTitle: page.heading,
      ogType: 'article' as const,
      publishedTime: `${sceneDetailMatch[2]}T00:00:00+08:00`,
      modifiedTime: `${sceneDetailMatch[2]}T00:00:00+08:00`,
      articleSection: scene?.collectionTitle,
      structuredDataTitle: page.heading
    };
  }

  return {
    title: page.title,
    description: page.description,
    socialTitle: page.heading,
    ogType: 'website' as const,
    structuredDataTitle: page.heading
  };
}

export function renderCriticalPageSnapshot(pathname: string) {
  const page = getCriticalPageContent(pathname);

  if (!page) return '';

  return `
    <article class="static-page-fallback" data-static-prerender>
      <main class="static-page-fallback__main">
        <header class="static-page-fallback__hero">
          <h1>${escapeHtml(page.heading)}</h1>
          <p>${escapeHtml(page.lead)}</p>
        </header>
        ${page.sections
          .map(
            (section) => `
              <section class="static-page-fallback__section">
                <h2>${escapeHtml(section.title)}</h2>
                ${renderParagraphs(section.paragraphs)}
                ${renderItems(section.items)}
              </section>
            `
          )
          .join('')}
        ${
          page.faq?.length
            ? `
              <section class="static-page-fallback__section">
                <h2>常见问题</h2>
                <div class="static-page-fallback__faq-list">
                  ${page.faq
                    .map(
                      (item) => `
                        <article class="static-page-fallback__faq-item">
                          <h3>${escapeHtml(item.question)}</h3>
                          <p>${escapeHtml(item.answer)}</p>
                        </article>
                      `
                    )
                    .join('')}
                </div>
              </section>
            `
            : ''
        }
      </main>
    </article>
  `;
}

export function createCriticalPageFaqStructuredData(pathname: string, absoluteUrl: string) {
  const page = getCriticalPageContent(pathname);

  if (!page?.faq?.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${absoluteUrl}#faq`,
    url: absoluteUrl,
    mainEntity: page.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    })),
    inLanguage: 'zh-CN'
  };
}

export function createCriticalPageBreadcrumbStructuredData(pathname: string, absoluteUrl: string, canonicalSiteUrl: string) {
  const items: Array<{ name: string; item: string }> = [{ name: 'Liutongxue 首页', item: `${canonicalSiteUrl}/` }];

  if (pathname === '/figures/') {
    items.push({ name: 'AI 人物对话实验', item: absoluteUrl });
  } else if (figureSeoByPath[pathname]) {
    items.push({ name: 'AI 人物对话实验', item: `${canonicalSiteUrl}/figures/` });
    items.push({ name: figureSeoByPath[pathname].heading, item: absoluteUrl });
  } else if (pathname === '/scene/') {
    items.push({ name: 'AI 团队场景日志', item: absoluteUrl });
  } else if (sceneSeoByPath[pathname]) {
    items.push({ name: 'AI 团队场景日志', item: `${canonicalSiteUrl}/scene/` });
    items.push({ name: sceneSeoByPath[pathname].collectionTitle, item: absoluteUrl });
  } else {
    const detailMatch = pathname.match(/^\/scene\/([^/]+)\/(\d{4}-\d{2}-\d{2})\/$/);

    if (detailMatch) {
      const scene = sceneSeoByPath[`/scene/${detailMatch[1]}/`];
      const page = getCriticalPageContent(pathname);

      if (scene && page) {
        items.push({ name: 'AI 团队场景日志', item: `${canonicalSiteUrl}/scene/` });
        items.push({ name: scene.collectionTitle, item: `${canonicalSiteUrl}${scene.path}` });
        items.push({ name: page.heading, item: absoluteUrl });
      }
    }
  }

  if (items.length < 2) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item
    }))
  };
}

const createPublisherReference = (canonicalSiteUrl: string) => ({
  '@id': `${canonicalSiteUrl}/#organization`
});

const createWebsiteReference = (canonicalSiteUrl: string) => ({
  '@id': `${canonicalSiteUrl}/#website`
});

const getFigureReferenceName = (figure: FigureSeoDefinition) =>
  figure.personName === figure.name ? figure.name : `${figure.personName}（${figure.name}）`;

const isJobFigure = (figure: FigureSeoDefinition) =>
  figure.id === 'customer-service' || figure.id === 'sales-assistant' || figure.id === 'video-script-assistant';

const createFigureReferencePerson = (figure: FigureSeoDefinition) =>
  isJobFigure(figure)
    ? {
        '@type': 'Thing',
        name: figure.personName,
        disambiguatingDescription: `此岗位仅作为 ${figure.heading} 的能力参考对象出现，不表示该页面是真实员工账号、人工客服窗口或服务承诺。`
      }
    : {
        '@type': 'Person',
        name: figure.personName,
        ...(figure.name !== figure.personName ? { alternateName: figure.name } : {}),
        disambiguatingDescription: `此人物仅作为 ${figure.heading} 的公开表达风格参考对象出现，不表示该页面是其官方主页、账号或真实表态。`
      };

const createFigureExperimentDisambiguation = (figure: FigureSeoDefinition) =>
  isJobFigure(figure)
    ? `${figure.heading} 是面向真实业务场景的 AI 岗位对话实验，不是真实员工账号、人工客服窗口或服务承诺。`
    : `${figure.heading} 是受 ${getFigureReferenceName(figure)}的公开表达风格启发的 AI 角色对话实验，不是本人官方账号、认证主页或真实表态。`;

export function createCriticalPagePrimaryStructuredData(pathname: string, absoluteUrl: string, canonicalSiteUrl: string) {
  const page = getCriticalPageContent(pathname);

  if (!page) return null;

  if (pathname === '/') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${canonicalSiteUrl}/#website`,
          url: `${canonicalSiteUrl}/`,
          name: 'Liutongxue',
          alternateName: ['liutongxue'],
          description: page.description,
          disambiguatingDescription: 'Liutongxue 是 AI 实验项目网站与公开发布主体，不是任何现实人物的官方主页或账号。',
          publisher: createPublisherReference(canonicalSiteUrl),
          about: [
            {
              '@type': 'Thing',
              name: 'AI 人物对话实验'
            },
            {
              '@type': 'Thing',
              name: 'AI 团队场景日志'
            }
          ],
          hasPart: [
            {
              '@id': `${canonicalSiteUrl}/figures/#webpage`
            },
            {
              '@id': `${canonicalSiteUrl}/scene/#webpage`
            }
          ],
          availableLanguage: ['zh-CN', 'zh-Hans'],
          audience: {
            '@type': 'Audience',
            audienceType: '中文互联网用户'
          },
          inLanguage: 'zh-CN'
        },
        {
          '@type': ['Organization', 'Project'],
          '@id': `${canonicalSiteUrl}/#organization`,
          name: 'Liutongxue',
          alternateName: ['liutongxue'],
          url: `${canonicalSiteUrl}/`,
          sameAs: ['https://github.com/DosLiu/liutongxue-web'],
          description: 'Liutongxue 是一个 AI 原生实验项目网站，长期并行更新人物对话实验与项目自己的工作日志。',
          disambiguatingDescription: 'Liutongxue 指的是 AI 实验项目与网站主体，不是任何现实人物的官方主页、账号或认证身份。',
          knowsAbout: ['AI 原生实验', 'AI 人物对话实验', 'AI 团队协作', '场景日志'],
          availableLanguage: ['zh-CN', 'zh-Hans'],
          audience: {
            '@type': 'Audience',
            audienceType: '中文互联网用户'
          }
        },
        {
          '@type': 'WebPage',
          '@id': `${canonicalSiteUrl}/#webpage`,
          url: `${canonicalSiteUrl}/`,
          name: page.title,
          isPartOf: createWebsiteReference(canonicalSiteUrl),
          description: page.description,
          disambiguatingDescription: '首页介绍的是 Liutongxue 这个 AI 实验项目本身，不是任何现实人物的官方主页。',
          about: [
            {
              '@id': `${canonicalSiteUrl}/#organization`
            },
            {
              '@type': 'Thing',
              name: 'AI 人物对话实验'
            },
            {
              '@type': 'Thing',
              name: 'AI 团队场景日志'
            }
          ],
          inLanguage: 'zh-CN'
        }
      ]
    };
  }

  if (pathname === '/figures/') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': `${absoluteUrl}#webpage`,
          url: absoluteUrl,
          name: page.title,
          description: page.description,
          abstract: page.lead,
          isPartOf: {
            '@id': `${canonicalSiteUrl}/#website`
          },
          mainEntity: {
            '@id': `${absoluteUrl}#itemlist`
          },
          about: [
            {
              '@type': 'Thing',
              name: 'AI 人物对话实验'
            },
            {
              '@type': 'Thing',
              name: '风格化角色对话'
            },
            {
              '@type': 'Thing',
              name: '人物表达风格实验'
            }
          ],
          inLanguage: 'zh-CN'
        },
        {
          '@type': 'ItemList',
          '@id': `${absoluteUrl}#itemlist`,
          name: 'Liutongxue AI 人物对话实验入口',
          itemListElement: figureSeoDefinitions.map((figure, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: figure.heading,
            url: `${canonicalSiteUrl}${figure.path}`
          }))
        }
      ]
    };
  }

  const figure = figureSeoByPath[pathname];
  if (figure) {
    const experimentId = `${absoluteUrl}#persona-experiment`;
    const figureReferencePerson = createFigureReferencePerson(figure);
    const experimentDisambiguation = createFigureExperimentDisambiguation(figure);

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'AboutPage',
          '@id': `${absoluteUrl}#webpage`,
          url: absoluteUrl,
          name: page.title,
          description: page.description,
          abstract: page.lead,
          isPartOf: createWebsiteReference(canonicalSiteUrl),
          mainEntity: {
            '@id': experimentId
          },
          about: [
            {
              '@id': experimentId
            },
            {
              '@type': 'Thing',
              name: 'AI 人物对话实验'
            }
          ],
          mentions: [figureReferencePerson],
          disambiguatingDescription: experimentDisambiguation,
          keywords: figure.keywords,
          inLanguage: 'zh-CN'
        },
        {
          '@type': ['CreativeWork', 'Conversation'],
          '@id': experimentId,
          url: absoluteUrl,
          name: figure.heading,
          alternateName: [`AI ${figure.name}`],
          description: page.description,
          abstract: page.lead,
          disambiguatingDescription: experimentDisambiguation,
          genre: isJobFigure(figure) ? 'AI 岗位对话实验' : 'AI 人物对话实验',
          keywords: figure.keywords,
          mainEntityOfPage: {
            '@id': `${absoluteUrl}#webpage`
          },
          about: figure.keywords.map((keyword) => ({
            '@type': 'Thing',
            name: keyword
          })),
          mentions: [figureReferencePerson],
          isBasedOn:
            isJobFigure(figure)
              ? {
                  '@type': 'CreativeWork',
                  name: `${getFigureReferenceName(figure)}岗位能力参考资料`,
                  about: figureReferencePerson,
                  description: `用于 ${figure.heading} 的岗位能力与服务边界参考资料集合。`
                }
              : {
                  '@type': 'CreativeWork',
                  name: `${getFigureReferenceName(figure)}的公开表达风格资料`,
                  about: figureReferencePerson,
                  description: `用于 ${figure.heading} 的公开表达风格参考资料集合。`
                },
          publisher: createPublisherReference(canonicalSiteUrl),
          inLanguage: 'zh-CN'
        }
      ]
    };
  }

  if (pathname === '/scene/') {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': `${absoluteUrl}#webpage`,
          url: absoluteUrl,
          name: page.title,
          description: page.description,
          isPartOf: {
            '@id': `${canonicalSiteUrl}/#website`
          },
          mainEntity: {
            '@id': `${absoluteUrl}#itemlist`
          },
          about: [
            {
              '@type': 'Thing',
              name: 'AI 原生团队'
            },
            {
              '@type': 'Thing',
              name: '工作日志'
            },
            {
              '@type': 'Thing',
              name: '协作现场'
            }
          ],
          inLanguage: 'zh-CN'
        },
        {
          '@type': 'ItemList',
          '@id': `${absoluteUrl}#itemlist`,
          name: 'Liutongxue 场景日志栏目',
          itemListElement: Object.values(sceneSeoDefinitions).map((scene, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: scene.heading.replace(/工作日志$/, ''),
            url: `${canonicalSiteUrl}${scene.path}`
          }))
        }
      ]
    };
  }

  const scene = sceneSeoByPath[pathname];
  if (scene) {
    const collection = sceneCollections[scene.key];
    const logs = sortLogsDesc(collection.logs).slice(0, 5);

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': `${absoluteUrl}#collection`,
          url: absoluteUrl,
          name: scene.collectionTitle,
          description: page.description,
          isPartOf: {
            '@id': `${canonicalSiteUrl}/#website`
          },
          mainEntity: {
            '@id': `${absoluteUrl}#itemlist`
          },
          inLanguage: 'zh-CN'
        },
        {
          '@type': 'ItemList',
          '@id': `${absoluteUrl}#itemlist`,
          name: `${scene.siteLabel} 最新公开日志`,
          numberOfItems: logs.length,
          itemListOrder: 'https://schema.org/ItemListOrderDescending',
          itemListElement: logs.map((log, index) => {
            const logUrl = `${canonicalSiteUrl}${getSceneDetailPath(scene.key, log.publishedAt)}`;
            return {
              '@type': 'ListItem',
              position: index + 1,
              url: logUrl,
              name: log.title,
              item: {
                '@type': 'BlogPosting',
                '@id': `${logUrl}#log`,
                url: logUrl,
                headline: log.title,
                description: log.preview,
                datePublished: log.publishedAt,
                dateModified: log.publishedAt,
                articleSection: scene.collectionTitle,
                inLanguage: 'zh-CN'
              }
            };
          })
        }
      ]
    };
  }

  const detailMatch = pathname.match(/^\/scene\/([^/]+)\/(\d{4}-\d{2}-\d{2})\/$/);
  if (detailMatch) {
    const detailScene = sceneSeoByPath[`/scene/${detailMatch[1]}/`];

    if (!detailScene) {
      return null;
    }

    const collectionUrl = `${canonicalSiteUrl}${detailScene.path}`;

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BlogPosting',
          '@id': `${absoluteUrl}#log`,
          url: absoluteUrl,
          headline: page.heading,
          description: page.description,
          datePublished: detailMatch[2],
          dateModified: detailMatch[2],
          genre: '工作日志',
          articleSection: detailScene.collectionTitle,
          mainEntityOfPage: {
            '@id': `${absoluteUrl}#webpage`
          },
          isPartOf: {
            '@type': 'CollectionPage',
            '@id': `${collectionUrl}#webpage`,
            url: collectionUrl,
            name: detailScene.collectionTitle
          },
          about: [
            {
              '@type': 'Thing',
              name: '日志详情'
            },
            {
              '@type': 'Thing',
              name: detailScene.siteLabel
            }
          ],
          publisher: createPublisherReference(canonicalSiteUrl),
          inLanguage: 'zh-CN'
        },
        {
          '@type': 'WebPage',
          '@id': `${absoluteUrl}#webpage`,
          url: absoluteUrl,
          name: page.heading,
          description: page.description,
          isPartOf: {
            '@id': `${canonicalSiteUrl}/#website`
          },
          about: {
            '@id': `${absoluteUrl}#log`
          },
          inLanguage: 'zh-CN'
        }
      ]
    };
  }

  return null;
}

export const criticalPageFallbackStyle = `
  .js [data-static-prerender] {
    display: none !important;
  }

  .static-page-fallback {
    min-height: 100vh;
    padding: clamp(6rem, 10vw, 8rem) clamp(1.5rem, 5vw, 4rem) 4rem;
    color: #f5f7fb;
    background: #060010;
  }

  .static-page-fallback__main {
    width: min(100%, 980px);
    margin: 0 auto;
  }

  .static-page-fallback__hero,
  .static-page-fallback__section,
  .static-page-fallback__item,
  .static-page-fallback__faq-item {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    background: rgba(15, 9, 25, 0.82);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
  }

  .static-page-fallback__hero,
  .static-page-fallback__section {
    padding: clamp(1.4rem, 3vw, 2rem);
  }

  .static-page-fallback__section + .static-page-fallback__section {
    margin-top: 1rem;
  }

  .static-page-fallback__hero {
    margin-bottom: 1rem;
  }

  .static-page-fallback h1,
  .static-page-fallback h2,
  .static-page-fallback h3 {
    margin: 0;
    color: #ffffff;
  }

  .static-page-fallback h1 {
    font-size: clamp(2.3rem, 4vw, 3.35rem);
    line-height: 1.12;
    letter-spacing: -0.04em;
  }

  .static-page-fallback h2 {
    font-size: clamp(1.25rem, 2vw, 1.55rem);
    line-height: 1.3;
    letter-spacing: -0.02em;
  }

  .static-page-fallback h3 {
    font-size: 1rem;
    line-height: 1.45;
  }

  .static-page-fallback p {
    margin: 0.7rem 0 0;
    color: rgba(236, 239, 244, 0.88);
    font-size: 1rem;
    line-height: 1.72;
  }

  .static-page-fallback__list {
    margin: 1rem 0 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 0.85rem;
  }

  .static-page-fallback__item,
  .static-page-fallback__faq-item {
    padding: 1rem 1.05rem;
  }

  .static-page-fallback__item a {
    color: #f9fbff;
    text-decoration: none;
  }

  .static-page-fallback__item a:hover {
    text-decoration: underline;
  }

  .static-page-fallback__meta {
    color: rgba(177, 199, 255, 0.82) !important;
    font-size: 0.92rem !important;
  }

  .static-page-fallback__faq-list {
    display: grid;
    gap: 0.85rem;
    margin-top: 1rem;
  }
`;

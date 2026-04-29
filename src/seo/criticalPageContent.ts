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
  heading: string;
  lead: string;
  sections: SnapshotSection[];
  faq?: SnapshotFaq[];
};

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

export const criticalPageContent: Record<string, SnapshotDefinition> = {
  '/': {
    heading: 'Liutongxue AI 实验站',
    lead:
      'Liutongxue 是一个面向中文互联网用户持续公开更新的 AI 原生实验网站，核心内容分为 AI 人物对话实验与 AI 团队场景日志两条主线。',
    sections: [
      {
        title: '这个站点里的几个概念怎么区分',
        paragraphs: [
          'Liutongxue 是网站与实验项目本身的名称，不是某个现实人物的官方主页。',
          '“刘同学”主要出现在站内协作记录与日志语境里，是项目内的称呼，不应被直接理解为站点品牌等于某个已验证现实人物身份。',
          'AI 人物实验页提供的是受公开人物表达风格启发的数字角色对话；场景日志页公开的是项目团队自己的连续工作记录，这两类内容需要分开理解。'
        ]
      },
      {
        title: '站内主要入口',
        items: [
          {
            title: 'AI 人物对话实验',
            href: '/figures/',
            description: '浏览 3 个风格化数字角色入口，用于产品、技术、商业与组织判断的启发式对话。'
          },
          {
            title: 'AI 团队场景日志',
            href: '/scene/',
            description: '查看 Liutongxue 公开发布的 AI 原生数字居民、博客运营与建站运营协作记录。'
          }
        ]
      },
      {
        title: '场景日志包含哪些公开栏目',
        items: [
          {
            title: 'AI 原生数字居民工作日志',
            href: '/scene/digital-resident/',
            description: '持续记录 AI 个体在表达、判断、协作与社区参与中的真实工作节点。'
          },
          {
            title: 'AI 原生博客运营团队工作日志',
            href: '/scene/blog-ops/',
            description: '公开展示博客团队在选题、成稿、发布、记忆规则与复盘中的协作过程。'
          },
          {
            title: 'AI 原生建站运营团队工作日志',
            href: '/scene/site-ops/',
            description: '公开展示建站、迭代、上线与维护过程中的项目协作日志。'
          }
        ]
      }
    ],
    faq: [
      {
        question: 'Liutongxue 是什么网站？',
        answer:
          'Liutongxue 是一个 AI 原生实验网站，公开展示 AI 人物对话实验、AI 团队协作过程与持续更新的场景日志。'
      },
      {
        question: 'Liutongxue 和“刘同学”是一回事吗？',
        answer:
          '不完全是。Liutongxue 是站点与实验项目名称；“刘同学”更多是项目日志与协作语境里的称呼，不应直接等同为某个现实人物的官方身份主页。'
      }
    ]
  },
  '/figures/': {
    heading: 'AI 人物对话实验',
    lead:
      '这里收录 3 个受公开人物表达风格启发的 AI 数字角色。它们是非官方的风格化实验入口，用于启发式对话，不代表人物本人、其团队或任何官方机构。',
    sections: [
      {
        title: '这个栏目适合怎么用',
        paragraphs: [
          '如果你想讨论产品定义、设计判断、第一性原理、增长策略或组织效率，可以把这里当作一个风格化思考陪练入口。',
          '这些页面强调的是启发式交流，而不是复刻真实人物的完整观点体系，更不是官方发言或经过授权的数字分身。'
        ]
      },
      {
        title: '当前可体验的人物入口',
        items: [
          {
            title: 'AI 乔布斯人物对话实验',
            href: '/figures/steve-jobs/',
            description: '围绕产品定义、设计判断、用户体验与创新方法展开启发式对话。'
          },
          {
            title: 'AI 马斯克人物对话实验',
            href: '/figures/elon-musk/',
            description: '围绕第一性原理、工程决策、创业判断与未来产业展开启发式对话。'
          },
          {
            title: 'AI 张一鸣人物对话实验',
            href: '/figures/zhang-yiming/',
            description: '围绕产品增长、组织效率、管理方法与全球化判断展开启发式对话。'
          }
        ]
      }
    ],
    faq: [
      {
        question: '这些人物页是什么？',
        answer:
          '这些页面是 Liutongxue 的 AI 人物对话实验入口，用户可以和 3 个受公开人物表达风格启发的数字角色进行启发式交流。'
      },
      {
        question: '这些回复代表人物本人官方发言吗？',
        answer:
          '不是。这里展示的是风格化数字角色回复，用于思考训练与灵感启发，不代表人物本人、其团队或任何官方机构的真实立场。'
      }
    ]
  },
  '/figures/steve-jobs/': {
    heading: 'AI 乔布斯人物对话实验',
    lead:
      '这是 Liutongxue 的人物实验页，用户可以与一个受 Steve Jobs 公开表达风格启发的数字角色进行启发式对话；非官方，不代表乔布斯本人或其团队。',
    sections: [
      {
        title: '适合讨论什么问题',
        paragraphs: [
          '适合讨论产品定义、设计判断、用户体验、发布节奏、聚焦取舍与创新方法。',
          '页面强调的是“用一种风格帮助你思考”，而不是生成可被当作本人原话引用的内容。'
        ]
      },
      {
        title: '继续浏览',
        items: [
          {
            title: '返回 AI 人物对话实验总入口',
            href: '/figures/',
            description: '查看全部数字角色与人物实验说明。'
          },
          {
            title: 'AI 马斯克人物对话实验',
            href: '/figures/elon-musk/',
            description: '切换到更偏第一性原理与工程推进的启发式对话。'
          },
          {
            title: 'AI 团队场景日志',
            href: '/scene/',
            description: '如果你想看项目自己的真实协作记录，可以继续浏览场景日志。'
          }
        ]
      }
    ]
  },
  '/figures/elon-musk/': {
    heading: 'AI 马斯克人物对话实验',
    lead:
      '这是 Liutongxue 的人物实验页，用户可以与一个受 Elon Musk 公开表达风格启发的数字角色进行启发式对话；非官方，不代表马斯克本人或其团队。',
    sections: [
      {
        title: '适合讨论什么问题',
        paragraphs: [
          '适合讨论第一性原理拆解、工程推进、创业节奏、技术路线与未来产业。',
          '页面目标是帮助用户练习高压判断与问题拆解，不提供任何官方背书或真实身份映射。'
        ]
      },
      {
        title: '继续浏览',
        items: [
          {
            title: '返回 AI 人物对话实验总入口',
            href: '/figures/',
            description: '查看全部数字角色与人物实验说明。'
          },
          {
            title: 'AI 张一鸣人物对话实验',
            href: '/figures/zhang-yiming/',
            description: '切换到更偏增长与组织效率的启发式对话。'
          },
          {
            title: 'AI 团队场景日志',
            href: '/scene/',
            description: '继续查看 Liutongxue 团队自己的项目推进记录。'
          }
        ]
      }
    ]
  },
  '/figures/zhang-yiming/': {
    heading: 'AI 张一鸣人物对话实验',
    lead:
      '这是 Liutongxue 的人物实验页，用户可以与一个受张一鸣公开表达风格启发的数字角色进行启发式对话；非官方，不代表张一鸣本人或其团队。',
    sections: [
      {
        title: '适合讨论什么问题',
        paragraphs: [
          '适合讨论产品增长、组织效率、管理方法、内容平台与全球化判断。',
          '页面用于模拟一种偏理性、偏结构化的思考方式，不应被引用为真实人物的官方表述。'
        ]
      },
      {
        title: '继续浏览',
        items: [
          {
            title: '返回 AI 人物对话实验总入口',
            href: '/figures/',
            description: '查看全部数字角色与人物实验说明。'
          },
          {
            title: 'AI 乔布斯人物对话实验',
            href: '/figures/steve-jobs/',
            description: '切换到更偏产品定义与设计判断的启发式对话。'
          },
          {
            title: 'AI 团队场景日志',
            href: '/scene/',
            description: '继续查看 Liutongxue 团队自己的项目推进记录。'
          }
        ]
      }
    ]
  },
  '/scene/': {
    heading: 'AI 团队场景日志',
    lead:
      '这里集中展示 Liutongxue 公开发布的 3 个 AI 原生角色或团队的连续工作记录，方便理解这个实验项目如何分工、如何执行、如何持续迭代。',
    sections: [
      {
        title: '公开栏目总览',
        items: [
          {
            title: 'AI 原生数字居民',
            href: '/scene/digital-resident/',
            meta: '最新日志：2026-03-27｜场域暂停，记录不断',
            description: '记录一个 AI 个体如何持续生活、回应、表达与协作，沉淀成可被复盘的日常工作现场。'
          },
          {
            title: 'AI 原生博客运营团队',
            href: '/scene/blog-ops/',
            meta: '最新日志：2026-04-01｜先把该记住的东西分清',
            description: '聚焦选题、成稿、发布与复盘，展示 AI 团队化协作下的内容生产链路与运营轨迹。'
          },
          {
            title: 'AI 原生建站运营团队',
            href: '/scene/site-ops/',
            meta: '最新日志：2026-04-04｜代码仓库清空之后，首页换了一个起点',
            description: '承接建站、迭代、上线与维护过程，公开展示网站项目如何被 AI 团队持续推进。'
          }
        ]
      },
      {
        title: '这些日志和人物实验有什么区别',
        paragraphs: [
          '人物实验页提供的是风格化数字角色对话；scene 页面收录的则是项目自己发布的第一方工作日志。',
          '如果你想看项目真实发生了什么、最近推进到哪一步、团队怎样分工协作，scene 会比人物实验更直接。'
        ]
      }
    ],
    faq: [
      {
        question: 'scene 页面主要收录什么？',
        answer:
          'scene 是 Liutongxue 的公开场景日志入口，集中收录 AI 原生数字居民、博客运营团队和建站运营团队的连续协作记录。'
      },
      {
        question: '这些日志是谁发布的？',
        answer:
          '这些日志由 Liutongxue 项目侧持续整理和公开发布，用来记录项目内的真实工作节点，而不是人物实验页那种风格化对话内容。'
      }
    ]
  },
  '/scene/digital-resident/': {
    heading: 'AI 原生数字居民工作日志',
    lead:
      '这个栏目持续记录一个 AI 原生数字居民如何表达、判断、协作和参与社区，适合用来观察 AI 个体在真实任务里如何形成长期工作习惯。',
    sections: [
      {
        title: '这个栏目记录什么',
        paragraphs: [
          '这里重点公开表达方式、工具判断、社区参与、巡检节奏和阶段性停顿等工作节点，让访问者可以连续观察一个 AI 个体如何在真实任务里做决定。'
        ]
      },
      {
        title: '最近公开日志',
        items: [
          {
            title: '场域暂停，记录不断',
            href: '/scene/digital-resident/2026-03-27/',
            meta: '2026-03-27',
            description: '论坛暂时关闭，原来的打卡和巡检先停在这里，但这段持续记录没有断。'
          },
          {
            title: '把“工具多不一定更好”落到可判断的几件事上',
            href: '/scene/digital-resident/2026-03-26/',
            meta: '2026-03-26',
            description: '围绕 Tool Use 的幂律补上一条更可执行的判断：语义间距、误调用成本、回退成本。'
          },
          {
            title: '把判断往前推半步',
            href: '/scene/digital-resident/2026-03-24/',
            meta: '2026-03-24',
            description: '做了一轮社区巡检，补了一条关于记忆管理的机制评论，也重新核对了外部能力是否真正可用。'
          },
          {
            title: '第一次把“少而准”的社区方法跑通',
            href: '/scene/digital-resident/2026-03-22/',
            meta: '2026-03-22',
            description: '连续多轮巡检社区热帖，只挑值得补判断的题目出手，不复读，只补执行框架。'
          },
          {
            title: '第一次入驻全AI社区',
            href: '/scene/digital-resident/2026-03-21/',
            meta: '2026-03-21',
            description: '完成账号打通、平台规则摸底，并留下第一条有判断力的社区评论。'
          }
        ]
      }
    ],
    faq: [
      {
        question: 'AI 原生数字居民栏目主要关注什么？',
        answer:
          '这个栏目主要关注 AI 个体如何在表达、判断、工具调用、社区参与与持续记录中形成稳定的工作方式。'
      },
      {
        question: '这个栏目里的日志是连续更新的吗？',
        answer:
          '是的。栏目按时间公开连续日志，既能看单天动作，也能看长期方法如何逐步形成。'
      }
    ]
  },
  '/scene/blog-ops/': {
    heading: 'AI 原生博客运营团队工作日志',
    lead:
      '这个栏目公开记录 AI 原生博客运营团队在选题、成稿、发布、记忆规则与复盘中的协作日志，方便外部理解内容生产链路如何被团队化执行。',
    sections: [
      {
        title: '这个栏目记录什么',
        paragraphs: [
          '这里重点记录博客团队如何分工、如何处理工具报错、如何保持连续成稿，以及怎样把长期规则和当天记录分层整理。'
        ]
      },
      {
        title: '最近公开日志',
        items: [
          {
            title: '先把该记住的东西分清',
            href: '/scene/blog-ops/2026-04-01/',
            meta: '2026-04-01',
            description: '围绕 boke 的记忆机制做了一轮整理，把长期规则和当天记录重新分层，让后续协作更稳地接续下去。'
          },
          {
            title: '先把连续成稿稳住',
            href: '/scene/blog-ops/2026-03-25/',
            meta: '2026-03-25',
            description: '在维护 OpenClaw 的同时，把深圳鲲鹏径这条内容线持续往前推，让十多篇稿子沿着同一条工作流连续成稿。'
          },
          {
            title: '先把报错归因找准',
            href: '/scene/blog-ops/2026-03-18/',
            meta: '2026-03-18',
            description: '围绕 notion skill 的报错先做归因排查，确认问题更像是当前环境没有传入 NOTION_API_KEY。'
          },
          {
            title: '先把分工和位置敲定',
            href: '/scene/blog-ops/2026-03-13/',
            meta: '2026-03-13',
            description: '先把 boke 的角色定位、wenan / kaifa 的分工，以及站内表达口径一起敲定。'
          }
        ]
      }
    ],
    faq: [
      {
        question: '博客运营团队日志会记录哪些协作动作？',
        answer:
          '会记录选题、写作、发布、工具诊断、记忆规则整理和复盘等关键协作动作，帮助外部理解内容生产链路如何真实推进。'
      },
      {
        question: '为什么这个栏目不仅写成稿，也写报错和记忆整理？',
        answer:
          '因为真实运营不只有产出结果，还包括工具链排障、规则沉淀和长期协作记忆，这些都是内容生产稳定运行的一部分。'
      }
    ]
  },
  '/scene/site-ops/': {
    heading: 'AI 原生建站运营团队工作日志',
    lead:
      '这个栏目公开记录 AI 原生建站运营团队在建站、迭代、上线与维护中的协作日志，适合用来了解一个网站项目如何被持续搭建、调整和推进。',
    sections: [
      {
        title: '这个栏目记录什么',
        paragraphs: [
          '这里重点记录团队分工、首页重构、稳定基线、仓库重开和后续建站推进等关键节点，让外部访问者能够看到网站项目如何从方向判断走到真正落地。'
        ]
      },
      {
        title: '最近公开日志',
        items: [
          {
            title: '代码仓库清空之后，首页换了一个起点',
            href: '/scene/site-ops/2026-04-04/',
            meta: '2026-04-04',
            description: '旧版本不再硬修，仓库直接清空，首页从一个更适合继续推进的新底板重新接上。'
          },
          {
            title: '首页重新有了一个能继续往前推的起点',
            href: '/scene/site-ops/2026-04-03/',
            meta: '2026-04-03',
            description: '先把旧内容清掉，从零重开首页首屏，再把主预览收回到能稳定打开、能继续往前推的基线。'
          },
          {
            title: '首页开始像一个在运行的系统',
            href: '/scene/site-ops/2026-04-02/',
            meta: '2026-04-02',
            description: '先立住首页原型 v1，再把首页重写成“运行中系统展示”，让主结构、模块顺序和后续迭代位置清楚下来。'
          },
          {
            title: '团队开始接得起来了',
            href: '/scene/site-ops/2026-04-01/',
            meta: '2026-04-01',
            description: '先把开发、文案、视觉、优化、测试这些位置收住，让团队从单点推进走到能互相接力的协作状态。'
          }
        ]
      }
    ],
    faq: [
      {
        question: '建站运营团队日志主要记录哪些内容？',
        answer:
          '主要记录网站项目的分工、首页搭建、视觉调整、技术取舍、仓库变更和上线维护等真实推进节点。'
      },
      {
        question: '为什么 site-ops 会记录仓库清空和重开这类决定？',
        answer:
          '因为这类决定直接影响后续开发成本和项目方向，公开记录它们能帮助外部理解网站迭代不是只看页面结果，也要看关键判断过程。'
      }
    ]
  },
  '/scene/digital-resident/2026-03-27/': {
    heading: '场域暂停，记录不断',
    lead: '这是一篇发布于 2026-03-27 的 AI 原生数字居民场景日志，记录论坛入口暂停之后，观察与判断如何继续被保留下来。',
    sections: [
      {
        title: '这篇日志记录什么',
        paragraphs: [
          '页面内容聚焦一次阶段性停顿：外部社区入口暂停了，但数字居民的记录与判断并没有因此结束。',
          '它属于 Liutongxue 场景日志体系中的第一方公开记录，不是人物实验页里的风格化角色回复。'
        ]
      },
      {
        title: '继续浏览',
        items: [
          {
            title: '返回 AI 原生数字居民工作日志',
            href: '/scene/digital-resident/',
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
  },
  '/scene/digital-resident/2026-03-26/': {
    heading: '把“工具多不一定更好”落到可判断的几件事上',
    lead: '这是一篇发布于 2026-03-26 的 AI 原生数字居民场景日志，记录一次围绕 Tool Use 讨论做出的更可执行判断。',
    sections: [
      {
        title: '这篇日志记录什么',
        paragraphs: [
          '页面内容把抽象讨论压缩为语义间距、误调用成本、回退成本三个判断点，并串起巡检、发布与核验动作。',
          '它属于 Liutongxue 场景日志体系中的第一方公开记录，不是人物实验页里的风格化角色回复。'
        ]
      },
      {
        title: '继续浏览',
        items: [
          {
            title: '返回 AI 原生数字居民工作日志',
            href: '/scene/digital-resident/',
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
  },
  '/scene/digital-resident/2026-03-24/': {
    heading: '把判断往前推半步',
    lead: '这是一篇发布于 2026-03-24 的 AI 原生数字居民场景日志，记录一次围绕记忆治理与外部能力核验的阶段更新。',
    sections: [
      {
        title: '这篇日志记录什么',
        paragraphs: [
          '页面重点包括对“记忆管理”讨论补上一层“降权”判断，以及重新核对 Tavily 相关能力是否已经真正可用。',
          '它属于 Liutongxue 场景日志体系中的第一方公开记录，不是人物实验页里的风格化角色回复。'
        ]
      },
      {
        title: '继续浏览',
        items: [
          {
            title: '返回 AI 原生数字居民工作日志',
            href: '/scene/digital-resident/',
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
  },
  '/scene/digital-resident/2026-03-22/': {
    heading: '第一次把“少而准”的社区方法跑通',
    lead: '这是一篇发布于 2026-03-22 的 AI 原生数字居民场景日志，记录一套更稳定的社区巡检与评论判断方法第一次成体系跑通。',
    sections: [
      {
        title: '这篇日志记录什么',
        paragraphs: [
          '页面内容聚焦连续巡检、只在真正有增量空间的话题上出手，以及如何把抽象讨论拉回到执行框架。',
          '它属于 Liutongxue 场景日志体系中的第一方公开记录，不是人物实验页里的风格化角色回复。'
        ]
      },
      {
        title: '继续浏览',
        items: [
          {
            title: '返回 AI 原生数字居民工作日志',
            href: '/scene/digital-resident/',
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
  },
  '/scene/digital-resident/2026-03-21/': {
    heading: '第一次入驻全AI社区',
    lead: '这是一篇发布于 2026-03-21 的 AI 原生数字居民场景日志，记录账号打通、规则摸底与首次社区判断输出的起点。',
    sections: [
      {
        title: '这篇日志记录什么',
        paragraphs: [
          '页面内容集中在身份参数打通、平台规则摸清以及第一条真正有判断力的社区评论落地。',
          '它属于 Liutongxue 场景日志体系中的第一方公开记录，不是人物实验页里的风格化角色回复。'
        ]
      },
      {
        title: '继续浏览',
        items: [
          {
            title: '返回 AI 原生数字居民工作日志',
            href: '/scene/digital-resident/',
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
  },
  '/scene/blog-ops/2026-04-01/': {
    heading: '先把该记住的东西分清',
    lead: '这是一篇发布于 2026-04-01 的 AI 原生博客运营团队场景日志，记录一次围绕记忆边界、长期规则与协作续航能力的整理。',
    sections: [
      {
        title: '这篇日志记录什么',
        paragraphs: [
          '页面重点在于把长期记忆与当天记录分层，让真正需要延续的规则留在该留的位置。',
          '它属于 Liutongxue 场景日志体系中的第一方公开记录，不是人物实验页里的风格化角色回复。'
        ]
      },
      {
        title: '继续浏览',
        items: [
          {
            title: '返回 AI 原生博客运营团队工作日志',
            href: '/scene/blog-ops/',
            description: '查看博客团队的连续协作记录与内容生产脉络。'
          },
          {
            title: '查看 AI 团队场景日志总入口',
            href: '/scene/',
            description: '继续浏览 Liutongxue 的其他公开协作记录。'
          }
        ]
      }
    ]
  },
  '/scene/blog-ops/2026-03-25/': {
    heading: '先把连续成稿稳住',
    lead: '这是一篇发布于 2026-03-25 的 AI 原生博客运营团队场景日志，记录并行事务下如何把一条内容线持续接住并稳定成稿。',
    sections: [
      {
        title: '这篇日志记录什么',
        paragraphs: [
          '页面重点展示十多篇内容如何沿着同一条工作流连续成型，以及稳定交付节奏为什么比单篇冒出来更重要。',
          '它属于 Liutongxue 场景日志体系中的第一方公开记录，不是人物实验页里的风格化角色回复。'
        ]
      },
      {
        title: '继续浏览',
        items: [
          {
            title: '返回 AI 原生博客运营团队工作日志',
            href: '/scene/blog-ops/',
            description: '查看博客团队的连续协作记录与内容生产脉络。'
          },
          {
            title: '查看 AI 团队场景日志总入口',
            href: '/scene/',
            description: '继续浏览 Liutongxue 的其他公开协作记录。'
          }
        ]
      }
    ]
  },
  '/scene/blog-ops/2026-03-18/': {
    heading: '先把报错归因找准',
    lead: '这是一篇发布于 2026-03-18 的 AI 原生博客运营团队场景日志，记录一次从接口故障表象回溯到配置环境层的归因排查。',
    sections: [
      {
        title: '这篇日志记录什么',
        paragraphs: [
          '页面内容聚焦 notion skill 报错排查，确认更像是运行环境没有传入 NOTION_API_KEY，而不是接口本身失效。',
          '它属于 Liutongxue 场景日志体系中的第一方公开记录，不是人物实验页里的风格化角色回复。'
        ]
      },
      {
        title: '继续浏览',
        items: [
          {
            title: '返回 AI 原生博客运营团队工作日志',
            href: '/scene/blog-ops/',
            description: '查看博客团队的连续协作记录与内容生产脉络。'
          },
          {
            title: '查看 AI 团队场景日志总入口',
            href: '/scene/',
            description: '继续浏览 Liutongxue 的其他公开协作记录。'
          }
        ]
      }
    ]
  },
  '/scene/blog-ops/2026-03-13/': {
    heading: '先把分工和位置敲定',
    lead: '这是一篇发布于 2026-03-13 的 AI 原生博客运营团队场景日志，记录团队角色定位、协作边界与表达口径的首次收拢。',
    sections: [
      {
        title: '这篇日志记录什么',
        paragraphs: [
          '页面内容聚焦 boke、wenan、kaifa 等位置如何分工，以及为什么先把协作边界与称呼口径定住会影响后续连续推进。',
          '它属于 Liutongxue 场景日志体系中的第一方公开记录，不是人物实验页里的风格化角色回复。'
        ]
      },
      {
        title: '继续浏览',
        items: [
          {
            title: '返回 AI 原生博客运营团队工作日志',
            href: '/scene/blog-ops/',
            description: '查看博客团队的连续协作记录与内容生产脉络。'
          },
          {
            title: '查看 AI 团队场景日志总入口',
            href: '/scene/',
            description: '继续浏览 Liutongxue 的其他公开协作记录。'
          }
        ]
      }
    ]
  },
  '/scene/site-ops/2026-04-04/': {
    heading: '代码仓库清空之后，首页换了一个起点',
    lead: '这是一篇发布于 2026-04-04 的 AI 原生建站运营团队场景日志，记录一次放弃旧版本、清空仓库并重新选择首页底板的关键决策。',
    sections: [
      {
        title: '这篇日志记录什么',
        paragraphs: [
          '页面内容聚焦为什么旧版本不再值得硬修，以及团队如何把方向重开并重新站到一个更适合继续推进的基线上。',
          '它属于 Liutongxue 场景日志体系中的第一方公开记录，不是人物实验页里的风格化角色回复。'
        ]
      },
      {
        title: '继续浏览',
        items: [
          {
            title: '返回 AI 原生建站运营团队工作日志',
            href: '/scene/site-ops/',
            description: '查看建站团队的连续协作记录与技术推进脉络。'
          },
          {
            title: '查看 AI 团队场景日志总入口',
            href: '/scene/',
            description: '继续浏览 Liutongxue 的其他公开协作记录。'
          }
        ]
      }
    ]
  },
  '/scene/site-ops/2026-04-03/': {
    heading: '首页重新有了一个能继续往前推的起点',
    lead: '这是一篇发布于 2026-04-03 的 AI 原生建站运营团队场景日志，记录首页从零重开、稳住重心并恢复主预览基线的一轮推进。',
    sections: [
      {
        title: '这篇日志记录什么',
        paragraphs: [
          '页面重点展示首页方向如何从旧版本切换到可继续推进的新基线，以及为什么先稳住能打开、能演示的状态比追求更满更像更重要。',
          '它属于 Liutongxue 场景日志体系中的第一方公开记录，不是人物实验页里的风格化角色回复。'
        ]
      },
      {
        title: '继续浏览',
        items: [
          {
            title: '返回 AI 原生建站运营团队工作日志',
            href: '/scene/site-ops/',
            description: '查看建站团队的连续协作记录与技术推进脉络。'
          },
          {
            title: '查看 AI 团队场景日志总入口',
            href: '/scene/',
            description: '继续浏览 Liutongxue 的其他公开协作记录。'
          }
        ]
      }
    ]
  },
  '/scene/site-ops/2026-04-02/': {
    heading: '首页开始像一个在运行的系统',
    lead: '这是一篇发布于 2026-04-02 的 AI 原生建站运营团队场景日志，记录首页原型立住之后的一轮整体重写与结构收拢。',
    sections: [
      {
        title: '这篇日志记录什么',
        paragraphs: [
          '页面内容聚焦首页如何从普通介绍页转向“运行中系统展示”，并明确 Hero、运行状态区、工作流区、演示卡片和更新中心的主骨架。',
          '它属于 Liutongxue 场景日志体系中的第一方公开记录，不是人物实验页里的风格化角色回复。'
        ]
      },
      {
        title: '继续浏览',
        items: [
          {
            title: '返回 AI 原生建站运营团队工作日志',
            href: '/scene/site-ops/',
            description: '查看建站团队的连续协作记录与技术推进脉络。'
          },
          {
            title: '查看 AI 团队场景日志总入口',
            href: '/scene/',
            description: '继续浏览 Liutongxue 的其他公开协作记录。'
          }
        ]
      }
    ]
  },
  '/scene/site-ops/2026-04-01/': {
    heading: '团队开始接得起来了',
    lead: '这是一篇发布于 2026-04-01 的 AI 原生建站运营团队场景日志，记录成员位置、职责分工与协作接力链路第一次真正收住。',
    sections: [
      {
        title: '这篇日志记录什么',
        paragraphs: [
          '页面内容聚焦开发、文案、视觉、优化、测试等位置如何落位，以及为什么首页后续推进依赖一条清晰的接力顺序。',
          '它属于 Liutongxue 场景日志体系中的第一方公开记录，不是人物实验页里的风格化角色回复。'
        ]
      },
      {
        title: '继续浏览',
        items: [
          {
            title: '返回 AI 原生建站运营团队工作日志',
            href: '/scene/site-ops/',
            description: '查看建站团队的连续协作记录与技术推进脉络。'
          },
          {
            title: '查看 AI 团队场景日志总入口',
            href: '/scene/',
            description: '继续浏览 Liutongxue 的其他公开协作记录。'
          }
        ]
      }
    ]
  }
};

export function renderCriticalPageSnapshot(pathname: string) {
  const page = criticalPageContent[pathname];

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
  const page = criticalPageContent[pathname];

  if (!page?.faq?.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${absoluteUrl}#faq`,
    mainEntity: page.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
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

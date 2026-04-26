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
    heading: 'Liutongxue 是一个 AI 原生数字生命实验与真实工作现场网站',
    lead:
      '这个网站公开展示 Liutongxue 的人物对话实验、AI 原生团队协作日志与持续更新的真实工作记录，方便访客快速理解这个项目在做什么、怎么协作、最近推进到了哪里。',
    sections: [
      {
        title: '首页能看到什么',
        paragraphs: [
          '首页主要承担项目总览：用一句话解释 Liutongxue 是什么，再把人物对话实验、AI 原生团队工作现场和联系方式放在同一个入口里，方便第一次访问的人快速建立整体认知。',
          '如果你想看持续发生的真实推进过程，建议从案发现场进入；如果你想看人物对话实验，则可以在主页了解对应入口与项目定位。'
        ]
      },
      {
        title: '案发现场包含哪些公开栏目',
        items: [
          {
            title: 'AI 原生数字居民工作日志',
            href: '/scene/digital-resident/',
            description: '持续记录 AI 个体在表达、判断、协作与社区参与中的真实工作日志。'
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
          'Liutongxue 是一个 AI 原生数字生命实验与真实工作现场网站，公开展示人物对话实验、AI 原生团队协作过程与持续更新的工作日志。'
      },
      {
        question: 'Liutongxue 主要更新什么内容？',
        answer:
          '目前重点更新首页项目说明、案发现场栏目，以及 3 个 AI 原生角色或团队的连续工作日志，帮助访客理解这个项目如何真实运转。'
      }
    ]
  },
  '/scene/': {
    heading: 'Liutongxue AI 原生团队工作现场与协作日志',
    lead:
      '这里集中展示 3 个 AI 原生角色或团队的公开工作日志，包括数字居民、博客运营和建站运营，适合快速了解它们分别负责什么、最近在推进什么。',
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
        title: '这些日志适合谁看',
        paragraphs: [
          '如果你想理解 AI 原生协作不是一句口号，而是一条怎么分工、怎么执行、怎么复盘的真实链路，这个栏目就是最直接的入口。',
          '每个栏目都按时间公开记录工作节点，方便搜索、复盘和后续引用。'
        ]
      }
    ],
    faq: [
      {
        question: '案发现场页面主要收录什么？',
        answer:
          '案发现场是 Liutongxue 的公开工作日志入口，集中收录 AI 原生数字居民、博客运营团队和建站运营团队的连续协作记录。'
      },
      {
        question: 'scene 页面和具体栏目页有什么区别？',
        answer:
          'scene 页面是总入口，负责解释有哪些公开栏目；进入具体栏目页后，可以继续查看单个角色或团队的连续日志和详情页。'
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
            title: '给记忆管理补上一层“降权”',
            href: '/scene/digital-resident/2026-03-24/',
            meta: '2026-03-24',
            description: '做了一轮社区巡检，补了一条关于记忆治理的机制评论，也重新核对了外部能力是否真正可用。'
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
            description: '先把 boke 的角色定位、wenan / kaifa 的分工，以及对刘同学的统一称呼一起敲定。'
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

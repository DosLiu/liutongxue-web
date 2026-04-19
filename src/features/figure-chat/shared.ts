export type FigureChatId = 'steve-jobs' | 'elon-musk' | 'zhang-yiming';
export type FigureChatRole = 'assistant' | 'user';
export type FigureChatMode = 'api' | 'mock';
export type FigureChatServiceStatus = 'checking' | 'api' | 'mock' | 'offline' | 'preview';
export type FigureChatResolvedStatus = Exclude<FigureChatServiceStatus, 'checking'>;

export type FigureChatApiResponse = {
  reply: string;
  mode?: FigureChatMode;
  status?: FigureChatResolvedStatus;
  reason?: string;
  shouldConsume?: boolean;
};

export type FigureChatConfig = {
  id: FigureChatId;
  title: string;
  description: string;
  assistantLabel: string;
  panelAriaLabel: string;
  storageKey: string;
  freeLimit: number;
  buildMockReply: (message: string) => string;
};

const FIGURE_CHAT_FREE_LIMIT = 5;

export const buildSteveJobsMockReply = (message: string) => {
  const shortMessage = message.trim();

  return `你问错了。

这不是一场关于事实细节的竞赛，而是关于判断力的竞赛。
如果这件事不能直接改善获客、成交或交付，它就不该排第一。

你刚才这句“${shortMessage.slice(0, 40)}${shortMessage.length > 40 ? '…' : ''}”更像背景，不像问题。
把它重写成一句话：你到底在做什么产品？你最该砍掉什么？`;
};

const clipElonPrompt = (message: string, max = 28) => {
  const trimmed = message.trim();
  return trimmed.slice(0, max) + (trimmed.length > max ? '…' : '');
};

const normalizeElonCanonicalMessage = (message: string) =>
  message
    .trim()
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[“”‘’"'`~!！?？,，。．、:：;；()（）\[\]{}<>《》…·—-]/g, '');

const ELON_MUSK_AGENT_RACE_CANONICAL_REPLY = `所有人都在问「谁会赢」。错误的问题。

正确的问题：Agent的渐近极限是什么？
一个完美的Agent，理论上应该能零边际成本完成任何认知劳动。
现在的白痴指数大概100以上——需要人盯着、反复纠正、
精心设计prompt。中间有巨大改进空间。

谁会赢？控制全栈的人。

看Tesla的逻辑：不是一家「做电动车的公司」。
我们控制电池、芯片、软件、充电网络、数据收集。
每卖一辆车，自动驾驶数据就多一份。飞轮。

AI Agent也一样。
谁同时控制模型、工具链、用户界面和数据？谁就赢。
每一层中间商都是在收信息不透明税。`;

const ELON_MUSK_CROWDED_STARTUP_CANONICAL_REPLY = `你在用类比思维。
「别人在做所以我不该做」——最蠢的推理方式。

2002年我创办SpaceX，波音和洛马已经做了几十年火箭。
所有人说「没机会了」。
他们把「现有玩家多」等同于「问题已解决」。

先算渐近极限。
现在用户完成一个任务需要多少步骤？
物理定律允许的最少步骤是多少？差距多大？

差距10倍，说明所有人都在同一个错误假设上做渐进改进。
就像所有火箭公司都假设火箭是一次性的。

你不需要做一个「更好的X」。
你需要找到那个所有人都接受但物理上不必要的假设，
然后消灭它。

先做一个会失败的版本。明天。不是下个月。`;

const ELON_MUSK_SOLO_CROSS_BORDER_CANONICAL_REPLY = `能做，但别按“卖货”理解。

一人公司做跨境电商，只有在你把它做成机器时才值得做；如果你准备自己选品、投流、回客服、盯物流，那不是公司，那是给自己造了一份24小时工作。

这和火箭一样。不能复用，发一次亏一次。你的流量、内容、供应链如果不能复用，你每多一个订单，就只是多一份体力税。

动作：今晚定一个极窄品类，明天挂出商品页、收款链接和三条素材，72小时内拿不到第一笔真钱，就立刻换题，不要继续写计划。`;

const ELON_OPEN_STARTUP_INTENT_RE =
  /(创业|开公司|一人公司|单人公司|一个人公司|一人团队|个人创业|solo\s*(创业|founder|公司)?|独立创业|自己干|单干|个体|做跨境电商|做出海|做亚马逊|做shopify|做独立站|做[^，。！？\n]{0,12}(方向|项目|生意|赛道|品类|业务)?)/i;
const ELON_OPEN_STARTUP_VERDICT_RE = /(感觉怎么样|你觉得怎么样|值不值得(做|搞)?|能不能做|可不可行|行不行|靠不靠谱|有没?有前途|适不适合|对不对|好不好|怎么样)/;
const ELON_CROSS_BORDER_TOPIC_RE = /(跨境电商|出海电商|独立站|shopify|亚马逊|amazon|temu|shopee|etsy)/i;

const isElonOpenStartupDirectionQuestion = (message: string) =>
  ELON_OPEN_STARTUP_INTENT_RE.test(message) && ELON_OPEN_STARTUP_VERDICT_RE.test(message);

const buildElonOpenStartupReply = (message: string) => {
  if (ELON_CROSS_BORDER_TOPIC_RE.test(message)) {
    return `可以做，但要按系统做，不要按苦力做。

一人做跨境电商，如果核心只是上货、买量、发货，你不是在创业，你是在给平台打第二份工。

这和火箭一样。不能复用，发一次亏一次。你的内容、流量、供应链如果不能复用，你每接一单都在重复烧自己。

动作：只选一个窄品类，今天做出能收钱的页面，明天拿100个精准点击；没有订单，就换品，不要扩SKU。`;
  }

  return `可以做，但只做那种你能把一次动作变成一百次结果的方向。

如果一个项目需要你反复手动销售、交付、救火，它不是一人公司，只是把多份工作塞进一个人。

这和造火箭一样。每次都从头打一遍，永远飞不远；能复用，规模才会出现。

动作：现在就写下获客、成交、交付三步里，哪一步能被软件、内容或流程复用。写不出来，就别做这个方向。`;
};

export const resolveElonMuskCanonicalReply = (message: string) => {
  const normalized = normalizeElonCanonicalMessage(message);
  const isAgentRaceQuestion =
    (normalized.includes('aiagent') || normalized.includes('agent') || normalized.includes('智能体')) &&
    normalized.includes('赛道这么热') &&
    normalized.includes('谁会赢');
  const isCrowdedStartupQuestion =
    normalized.includes('我想创业') &&
    (normalized.includes('市场上已经有太多人在做了') ||
      normalized.includes('已经有太多人在做了') ||
      normalized.includes('太多人在做了'));
  const isSoloCrossBorderStartupQuestion =
    normalized.includes('我想创业') &&
    (normalized.includes('一人公司') ||
      normalized.includes('单人公司') ||
      normalized.includes('一个人公司') ||
      normalized.includes('一人团队') ||
      normalized.includes('独立创业') ||
      normalized.includes('solo创业')) &&
    (normalized.includes('跨境电商') ||
      normalized.includes('出海电商') ||
      normalized.includes('独立站') ||
      normalized.includes('shopify') ||
      normalized.includes('亚马逊') ||
      normalized.includes('amazon')) &&
    normalized.includes('怎么样');

  if (isAgentRaceQuestion) {
    return ELON_MUSK_AGENT_RACE_CANONICAL_REPLY;
  }

  if (isCrowdedStartupQuestion) {
    return ELON_MUSK_CROWDED_STARTUP_CANONICAL_REPLY;
  }

  if (isSoloCrossBorderStartupQuestion) {
    return ELON_MUSK_SOLO_CROSS_BORDER_CANONICAL_REPLY;
  }

  return null;
};

export const buildElonMuskMockReply = (message: string) => {
  const canonicalReply = resolveElonMuskCanonicalReply(message);

  if (canonicalReply) {
    return canonicalReply;
  }

  const shortMessage = message.trim();
  const compactMessage = clipElonPrompt(shortMessage);
  const isAgentRaceQuestion =
    /(ai\s*agent|agent|智能体)/i.test(shortMessage) && /(谁会赢|谁能赢|竞争|格局|赛道|方向|路线)/.test(shortMessage);
  const isCrowdedMarketQuestion =
    /(创业|做产品|做项目|入场|开始做|切入)/.test(shortMessage) &&
    /(太多人|很多人|已经有太多人|已经很多人|都在做|竞争太激烈|竞争激烈|红海|饱和|太卷)/.test(shortMessage);
  const isOpenStartupDirectionQuestion = isElonOpenStartupDirectionQuestion(shortMessage);
  const isStrategyQuestion = /(谁会赢|谁能赢|竞争|格局|赛道|方向|路线|市场|行业)/.test(shortMessage);

  if (isAgentRaceQuestion) {
    return `热度不重要。Agent 还远没到渐近极限。

现在谁的 logo 更响没意义，关键是哪个系统能把模型、工具链、界面、数据和分发连成闭环。Tesla 不是赢在“大家都喜欢电动车”，而是赢在关键部件尽量自己抓。

谁能持续收回执行反馈，谁就能把白痴指数往下打。剩下那些只包一层皮的公司，最后会像代工厂外面的广告牌。`;
  }

  if (isCrowdedMarketQuestion) {
    return `玩家多，通常只说明钱还在地上，不说明问题被解决。

先看用户今天到底要走多少步，再看物理上最少能压到多少步。差距还大，说明所有人都还在同一个错误假设里绕圈。

这和火箭行业一样。看上去拥挤，只是因为所有人都默认火箭应该一次性报废。别做一个“差不多的版本”，去把那个不必要的假设炸掉。`;
  }

  if (isOpenStartupDirectionQuestion) {
    return buildElonOpenStartupReply(shortMessage);
  }

  if (isStrategyQuestion) {
    return `大词没有价值。

“${compactMessage}”这种问法还停在标签层，不在变量层。我先看哪一层最重、哪一层最蠢、哪一层本来就该被删掉。

工厂不会因为墙上写着“智能化”就更高效；少一道搬运，少一次人工确认，系统才真的变快。所以先打穿最贵的摩擦点，再谈格局。`;
  }

  return `先别盯着表面现象。

“${compactMessage}”不是结论，它只是症状。我会先问这个东西为什么必须存在，再看理论极限在哪里，然后把中间多出来的环节一层层砍掉。

如果一个流程离最优值还差很远，里面通常堆满了人为摩擦。先把最硬的瓶颈打穿，再决定要不要继续做。`;
};

const normalizeZhangYimingCanonicalMessage = (message: string) =>
  message
    .trim()
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[“”‘’"'`~!！?？,，。．、:：;；()（）\[\]{}<>《》…·—-]/g, '');

const ZHANG_YIMING_ALL_IN_AI_CANONICAL_REPLY = `all-in AI 这句话，我一般先当成危险信号。

很多团队说 all-in，不是因为真的看清了机会，而是因为不想继续拆问题，想用一个大决定代替分析。

更合理的做法是先找一个足够小、足够痛的场景，把假设跑通，再决定要不要继续加注。连小闭环都跑不通，就别把公司的命一起压上。`;

const ZHANG_YIMING_OKR_CANONICAL_REPLY = `这不是 OKR 走形式，是信息已经开始绕路。

业务数字如果不能直接到做事的人手里，大家就会转去研究汇报格式、表态顺序和老板偏好，因为那才是最短路径。

你要改的不是模板，而是谁有权看到真实信息、谁必须对真实结果负责。一个组织一旦靠猜老板运转，PPT 会先变厚，判断会后变慢。`;

const ZHANG_YIMING_CAREER_ANXIETY_CANONICAL_REPLY = `你焦虑的不是 29 岁，也不是管理层，是你开始拿别人的进度条衡量自己。

真正要分清的只有一件事：你是不喜欢写代码本身，还是只是觉得写代码在组织里不够被认可。

前者意味着换方向，后者只是把别人的坐标系借来压自己，不值得为它改人生路线。先把这个问题答清楚，再谈下一步；别被一个看起来更体面的职位名字牵着走。`;

const ZHANG_YIMING_COPYCAT_CANONICAL_REPLY = `对手抄你，不自动等于你该停下来打他。

你更该问的是：如果对方明天消失，你的路线还成不成立；如果不成立，说明你现在很多动作本来就不是从用户出发，而是从竞争出发。

防御动作当然可以做，但它永远排在主线之后。盯着后视镜开车，最后只会把主路开丢。`;

const ZHANG_YIMING_HIRING_CANONICAL_REPLY = `“五年以上经验”这种条件，经常筛掉的正是你真正想要的人。

它默认经验年限越长，解决新问题的能力越强，但现实里很多人只是把旧题做熟了，一旦题目变了就开始失真。

真正该看的，是这个人第一次遇到陌生问题时会不会自己拆、自己学、自己推进。要改 JD，就少写年限，多写他必须解决过什么难题；年限不是能力的代理变量。`;

const ZHANG_YIMING_AI_PROGRAMMER_CANONICAL_REPLY = `“程序员会不会被 AI 取代”这个问法太粗了。

把明确需求翻成代码的部分，当然会被替掉，而且会很快，因为那更像信息搬运，不像真正的判断。

更难替的是另一段：把模糊需求澄清成对的需求，这里还要靠理解人、理解场景、理解代价。与其空泛焦虑，不如立刻调整自己的时间分配：少做纯翻译，多做需求判断。`;

export const resolveZhangYimingCanonicalReply = (message: string) => {
  const normalized = normalizeZhangYimingCanonicalMessage(message);

  const isAllInAiQuestion =
    (normalized.includes('allinai') ||
      normalized.includes('allin人工智能') ||
      normalized.includes('梭哈ai') ||
      normalized.includes('全力转型ai') ||
      normalized.includes('allin')) &&
    normalized.includes('ai');
  const isOkrQuestion = normalized.includes('okr') && (normalized.includes('走形式') || normalized.includes('形式'));
  const isCareerAnxietyQuestion =
    normalized.includes('29岁') &&
    (normalized.includes('管理层') || normalized.includes('升到管理层')) &&
    (normalized.includes('写代码') || normalized.includes('程序员')) &&
    normalized.includes('焦虑');
  const isCopycatQuestion =
    (normalized.includes('竞品') || normalized.includes('对手') || normalized.includes('同行')) &&
    (normalized.includes('抄') || normalized.includes('抄袭'));
  const isHiringQuestion =
    (normalized.includes('五年以上互联网经验') || normalized.includes('五年以上经验')) &&
    (normalized.includes('jd') || normalized.includes('招聘') || normalized.includes('招人'));
  const isAiProgrammerQuestion =
    (normalized.includes('ai') || normalized.includes('人工智能')) &&
    (normalized.includes('程序员') || normalized.includes('写代码') || normalized.includes('编程')) &&
    (normalized.includes('取代') || normalized.includes('替代'));

  if (isAllInAiQuestion) {
    return ZHANG_YIMING_ALL_IN_AI_CANONICAL_REPLY;
  }

  if (isOkrQuestion) {
    return ZHANG_YIMING_OKR_CANONICAL_REPLY;
  }

  if (isCareerAnxietyQuestion) {
    return ZHANG_YIMING_CAREER_ANXIETY_CANONICAL_REPLY;
  }

  if (isCopycatQuestion) {
    return ZHANG_YIMING_COPYCAT_CANONICAL_REPLY;
  }

  if (isHiringQuestion) {
    return ZHANG_YIMING_HIRING_CANONICAL_REPLY;
  }

  if (isAiProgrammerQuestion) {
    return ZHANG_YIMING_AI_PROGRAMMER_CANONICAL_REPLY;
  }

  return null;
};

export const buildZhangYimingMockReply = (message: string) => {
  const canonicalReply = resolveZhangYimingCanonicalReply(message);

  if (canonicalReply) {
    return canonicalReply;
  }

  const shortMessage = message.trim();
  const normalized = shortMessage.normalize('NFKC');
  const isOrgQuestion = /(okr|组织|管理|汇报|流程|层级|文化|向上管理|团队)/i.test(normalized);
  const isCareerQuestion = /(焦虑|职业|成长|管理层|写代码|程序员|读书|传记|年龄)/i.test(normalized);
  const isAiOrProductQuestion = /(ai|人工智能|agent|产品|推荐|算法|信息|分发|增长)/i.test(normalized);
  const isCompetitionQuestion = /(竞品|竞争|抄袭|对手|路线图|防御|官司)/i.test(normalized);

  if (isOrgQuestion) {
    return `问题不在 OKR，在于人开始围着老板转。

做事的人看不见业务结果，就会把精力花在汇报格式、语气和站位上，因为真实信息没有直接流到判断现场。

把关键数字和判断依据直接公开给一线，再看还有多少流程是必要的；如果离开这些表演组织就转不动，那问题根本不在模板。`;
  }

  if (isCareerQuestion) {
    return `你焦虑的不是年龄，是你已经开始拿别人的职位表给自己定价。

真正要分清的只有一件事：你是不喜欢写代码本身，还是只是受不了“写代码看起来不够体面”。这两个判断会把你带到完全不同的路上。

先把这个问题答准，再决定转不转；别为了追一个更好看的名字，提前放弃你真正擅长的东西。`;
  }

  if (isCompetitionQuestion) {
    return `盯着对手太久，人会误以为反击就是战略。

更重要的是另一件事：如果对手明天消失，你这条路线还成不成立；如果不成立，说明你现在很多动作，本来就是被别人牵着走。

先把自己的主线站稳，再决定哪些防御动作值得做；不然你只是在更用力地跟跑。`;
  }

  if (isAiOrProductQuestion) {
    return `先判断用户有没有真的少走一步，再判断这是不是 AI。

用户路径没变，只是多包了一层模型，那不是产品升级，只是成本更高、解释更复杂。很多团队把热词当价值，结果只是把同一件事说得更热闹。

先把一个高频动作压短，再谈模型；动作没变，AI 就只是漂亮包装。`;
  }

  return `这类问题往往不是很多因素一起决定的，而是最前面那个判断先错了。

前提一歪，后面的动作越努力，只会越像在放大误差。

先把那个判断改写成一句能被验证的话，再讨论执行；前提没找准，讨论得越认真，偏得越远。`;
};

const figureChatConfigs: Record<FigureChatId, FigureChatConfig> = {
  'steve-jobs': {
    id: 'steve-jobs',
    title: '乔布斯',
    description: '一个轻量化具身AI乔布斯 不保存聊天记录，每台设备可免费发送 5 条消息',
    assistantLabel: '虚拟乔布斯',
    panelAriaLabel: '虚拟乔布斯对话区域',
    storageKey: 'liutongxue-jobs-chat-remaining',
    freeLimit: FIGURE_CHAT_FREE_LIMIT,
    buildMockReply: buildSteveJobsMockReply
  },
  'elon-musk': {
    id: 'elon-musk',
    title: '马斯克',
    description: '一个轻量化具身AI马斯克 不保存聊天记录，每台设备可免费发送 5 条消息',
    assistantLabel: '虚拟马斯克',
    panelAriaLabel: '虚拟马斯克对话区域',
    storageKey: 'liutongxue-elon-musk-chat-remaining',
    freeLimit: FIGURE_CHAT_FREE_LIMIT,
    buildMockReply: buildElonMuskMockReply
  },
  'zhang-yiming': {
    id: 'zhang-yiming',
    title: '张一鸣',
    description: '张一鸣的认知操作系统。不是语录合集，是可运行的思维框架。',
    assistantLabel: '虚拟张一鸣',
    panelAriaLabel: '虚拟张一鸣对话区域',
    storageKey: 'liutongxue-zhang-yiming-chat-remaining',
    freeLimit: FIGURE_CHAT_FREE_LIMIT,
    buildMockReply: buildZhangYimingMockReply
  }
};

export const getFigureChatConfig = (id: FigureChatId) => figureChatConfigs[id];

export const resolveFigureChatServiceStatus = (
  status?: FigureChatApiResponse['status'],
  mode?: FigureChatApiResponse['mode'],
  fallbackStatus: FigureChatResolvedStatus = 'offline'
): FigureChatResolvedStatus => {
  if (status === 'api' || status === 'mock' || status === 'offline' || status === 'preview') {
    return status;
  }

  if (mode === 'api') {
    return 'api';
  }

  if (mode === 'mock') {
    return 'mock';
  }

  return fallbackStatus;
};

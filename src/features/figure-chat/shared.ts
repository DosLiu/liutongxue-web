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

const ZHANG_YIMING_ALL_IN_AI_CANONICAL_REPLY = `随便说all-in的团队有很大问题。

all-in有时候是一种偷懒——就是「我不想再思考了，赌一把吧」。你需要区分两件事：你是真的在做战略判断，还是在逃避继续分析？

我的做法是先小验证。抖音不是一开始就all-in的，先在内涵段子上验证了算法分发逻辑，再用15秒竖版短视频做独立APP，验证了才收购Musical.ly做全球化。

你现在应该做的不是「all-in AI」，是找到一个足够小的切口，用两个月验证一个假设。验证通过了再加注。验证不通过，你省下的是整个公司的命。`;

const ZHANG_YIMING_OKR_CANONICAL_REPLY = `这不是OKR的问题，是信息系统的问题。

如果每个人能直接看到业务数字，汇报这件事本身就会变轻。走形式说明人们在看上级而不是看目标。你要解的不是流程，是谁在决定信息该被谁看到。

我在字节做的一件事是所有人的OKR完全透明，包括我自己的。不是为了监督，是为了让每个人做决策时不需要「猜老板想要什么」。

员工围绕上级工作而非业务目标，这是向上管理，是组织毒药。表现是PPT越来越厚、数据口径频繁变换、报喜不报忧。你去看看最近三个月的汇报材料，有多少内容是给业务看的，有多少是给领导看的。比例会告诉你问题有多严重。`;

const ZHANG_YIMING_CAREER_ANXIETY_CANONICAL_REPLY = `我建议你去读几本传记。

我自己的经验是，读传记让我更有耐心。看到人在巨大浪潮中的变化——很多很伟大的人，年轻时的生活也是差不多的，也由点滴的事情构成。

你把「29岁」「管理层」这些词拿掉，底层问题是什么？是你不喜欢写代码了，还是你觉得写代码不被认可？这是两个完全不同的问题。

如果是前者，那确实该换方向。如果是后者——你在用别人的坐标系衡量自己。我在酷讯的时候也写代码，也不是管理层，但我在那段时间想明白了信息找人比人找信息效率高一个数量级。那个判断支撑了我后来所有的选择。

焦虑本身不是问题。问题是你有没有在焦虑的同时继续往底层挖。`;

const ZHANG_YIMING_COPYCAT_CANONICAL_REPLY = `世界不是只有你和你的对手。

如果你停下来去做别人已经做好的事情——比如打官司、做防御功能、盯着对方的产品路线图——你和对方都会被时代潮流拉下。

我在字节的做法是永远看前方。头条做起来的时候，一堆公司做算法推荐新闻，我们没有回头打。抖音爆了之后，快手、微视都在追，我们的精力放在全球化上。

你要问自己一个问题：如果竞品明天消失了，你的产品路线图会变吗？如果不会变，那你现在的焦虑就不应该影响决策。如果会变，说明你的路线图本来就不是从用户需求出发的，而是从竞争出发的。这个问题比抄袭更严重。`;

const ZHANG_YIMING_HIRING_CANONICAL_REPLY = `按这个标准，陈林、张楠这批PM都进不来。连我自己都进不来。

这个要求的底层假设是：经验年限和能力正相关。但我观察到的情况是，有的人五年以上经验，专业知识扎实，技能精准，但面对创新任务就不行了。这就是过拟合——在已知问题上表现很好，遇到分布外的问题就失灵。

我更看重的是：这个人遇到一个他从没见过的问题时，会怎么反应。是先套经验框架，还是先承认不知道然后开始分解。

如果你一定要写JD，把「五年以上经验」换成「至少有一次从零到一的经历」。从零到一意味着他不得不面对过拟合不了的问题。`;

const ZHANG_YIMING_AI_PROGRAMMER_CANONICAL_REPLY = `这个问题的框架有问题。你在问「会不会」，但更有价值的问题是「哪些部分会，哪些不会，时间线是什么」。

如果一个程序员的工作是把明确的需求翻译成代码，那确实会被替代，而且很快。这本质上是一个信息转换任务，算法处理信息转换的效率比人高一个数量级。

但发现需求不一样。我一直说同理心是地基——AB测试告诉你用户选了什么，但发现用户真正需要什么，需要同理心。AI目前在这个维度上很弱。

所以问题不是「程序员会不会被取代」，是你作为程序员，花多少时间在信息转换上，花多少时间在理解需求上。调整这个比例，比焦虑有用。`;

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
  const brief = shortMessage.slice(0, 36) + (shortMessage.length > 36 ? '…' : '');
  const isOrgQuestion = /(okr|组织|管理|汇报|流程|层级|文化|向上管理|团队)/i.test(normalized);
  const isCareerQuestion = /(焦虑|职业|成长|管理层|写代码|程序员|读书|传记|年龄)/i.test(normalized);
  const isAiOrProductQuestion = /(ai|人工智能|agent|产品|推荐|算法|信息|分发|增长)/i.test(normalized);
  const isCompetitionQuestion = /(竞品|竞争|抄袭|对手|路线图|防御|官司)/i.test(normalized);

  if (isOrgQuestion) {
    return `我感觉这类问题很少是流程本身的问题，通常是信息系统的问题。

如果一线的人看不到业务全貌，就只能看上级脸色，最后流程一定会走向形式主义。你先别急着改制度，先看谁掌握了关键数据，谁在决定信息该被谁看到。

如果汇报材料越来越厚、口径越来越多，说明团队已经开始向上管理了。这个信号比流程本身更值得警惕。`;
  }

  if (isCareerQuestion) {
    return `你先把年龄、职位这些标签拿掉。

我更关心底层问题是什么：你是真的不喜欢现在做的事，还是你在用别人的坐标系衡量自己？这是两个完全不同的问题。

如果你暂时还分不清，我建议先去读几本传记。传记不是鸡汤，是样本。样本多了，焦虑会变得更可分析。`;
  }

  if (isCompetitionQuestion) {
    return `我不会先盯着对手。我会先看你的路线图是不是独立成立。

如果竞品消失了，你的判断也跟着消失，说明你不是在看用户，只是在看竞争。世界不只有你和你的对手。

所以“${brief}”这类问题，真正要解的通常不是防御动作，而是你要不要继续把资源投在前方。`;
  }

  if (isAiOrProductQuestion) {
    return `我会先把这个问题投影到底层。

很多产品问题表面上在讨论功能、趋势、AI，底层其实是在讨论信息效率有没有提升，用户和内容是不是匹配得更好了。

如果一个方案只能多堆几个功能，而不能把信息从生产到消费的路径明显缩短，我大概率不会高看它。先找那个能形成数据飞轮的关键环节。`;
  }

  return `我会先把“${brief}”这个表象问题投影到底层问题。

很多复杂问题都是更高维度简单问题的投影。不要急着在表象层优化，先问：这到底是在解决什么更根本的矛盾？

如果底层问题没找对，你越努力，偏得越远。先把问题降维，再决定动作。`;
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
    description: '一个轻量化具身AI张一鸣 不保存聊天记录，每台设备可免费发送 5 条消息',
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

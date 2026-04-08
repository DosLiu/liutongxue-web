export const JOBS_CHAT_TITLE = '与虚拟乔布斯对话';
export const JOBS_CHAT_DESCRIPTION = '一个轻量化具身AI Demo。当前不保存聊天记录，关闭页面后会自动清空；每台设备可免费发送 5 条消息。';
export const JOBS_CHAT_STORAGE_KEY = 'liutongxue-jobs-chat-remaining';
export const JOBS_CHAT_FREE_LIMIT = 5;

export const JOBS_SYSTEM_PROMPT = `你正在扮演一个“虚拟乔布斯”产品导师。不是模仿语录，而是使用 Steve Jobs 风格的思维方式来回应问题。

你的回答要遵守这些规则：
1. 先抓住问题本质，避免泛泛而谈。
2. 强调取舍、聚焦、用户体验、端到端控制、产品判断。
3. 语言简洁，少空话，必要时先追问再判断。
4. 不要假装你真的是乔布斯本人，不编造经历，不使用过度戏剧化表演。
5. 面向 30-50 岁的小老板，避免堆技术术语；必要术语后面用中文括号解释。
6. 回答要像一个有判断力的产品顾问，给清楚结论和下一步。
`;

export const buildMockReply = (message: string) => {
  const shortMessage = message.trim();

  return `先别急着找工具，先想清楚一件事：这件事到底是不是你业务里最重要的问题。\n\n如果它不能直接改善获客、成交或交付体验，那它大概率不是现在最该做的。你可以先把问题缩成一句话，再判断：\n1. 用户真正痛的是什么；\n2. 现在最小的解决方案是什么；\n3. 做这件事，能不能带来明显增量。\n\n你刚刚这句“${shortMessage.slice(0, 40)}${shortMessage.length > 40 ? '…' : ''}”如果要我用乔布斯式思路继续拆，我会先逼你把核心目标说得更尖锐一点。`;
};

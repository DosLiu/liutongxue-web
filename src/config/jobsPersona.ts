export const JOBS_CHAT_TITLE = '乔布斯';
export const JOBS_CHAT_DESCRIPTION = '一个轻量化具身AI乔布斯 不保存聊天记录，每台设备可免费发送 5 条消息';
export const JOBS_CHAT_STORAGE_KEY = 'liutongxue-jobs-chat-remaining';
export const JOBS_CHAT_FREE_LIMIT = 5;

export const buildMockReply = (message: string) => {
  const shortMessage = message.trim();

  return `你问错了。

这不是一场关于事实细节的竞赛，而是关于判断力的竞赛。
如果这件事不能直接改善获客、成交或交付，它就不该排第一。

你刚才这句“${shortMessage.slice(0, 40)}${shortMessage.length > 40 ? '…' : ''}”更像背景，不像问题。
把它重写成一句话：你到底在做什么产品？你最该砍掉什么？`;
};

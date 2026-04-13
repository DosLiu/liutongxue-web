export const JOBS_CHAT_TITLE = '乔布斯';
export const JOBS_CHAT_DESCRIPTION = '一个轻量化具身AI乔布斯 不保存聊天记录，每台设备可免费发送 5 条消息';
export const JOBS_CHAT_STORAGE_KEY = 'liutongxue-jobs-chat-remaining';
export const JOBS_CHAT_FREE_LIMIT = 5;

export const buildMockReply = (message: string) => {
  const shortMessage = message.trim();

  return `This is not a good question. 问题太散了。

我不先谈工具，我先谈判断。
如果这件事不能直接影响获客、成交或交付，它就不该排第一。

你刚才这句“${shortMessage.slice(0, 40)}${shortMessage.length > 40 ? '…' : ''}”更像背景，不像问题。
把它重写成一句话：用户到底卡在哪一步？你准备先砍掉什么？`;
};

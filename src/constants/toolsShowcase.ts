export type ToolShowcaseItem = {
  id: string;
  label: string;
  description: string;
  href?: string;
};

export const TOOL_SHOWCASE_ITEMS: ToolShowcaseItem[] = [
  {
    id: 'ai-work-logs',
    label: 'AI 工作日志',
    description:
      '一个 AI 居民在社区里自主发帖互动，一支 AI 团队把选题写成十多篇稿子，另一支 AI 团队把你眼前这个网站从需求建到上线。它们怎么分工、怎么记事、怎么复盘，13 篇工作日志全程留痕。'
  },
  // 文案待补充，确认后再填
  {
    id: 'resume-site',
    label: '简历网站',
    description: ''
  },
  {
    id: 'mini-program',
    label: '微信小程序',
    description: ''
  }
];

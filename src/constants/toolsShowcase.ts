import { sitePaths } from '../site';

export type ToolShowcaseItem = {
  id: string;
  label: string;
  description: string;
  href?: string;
  tag?: string;
  status?: string;
  isExternal?: boolean;
};

export const TOOL_SHOWCASE_ITEMS: ToolShowcaseItem[] = [
  {
    id: 'ai-work-logs',
    label: 'AI 工作日志',
    tag: '智能体团队协作 · 13篇全留痕',
    status: '持续留痕',
    description:
      '一个 AI 居民在社区里自主发帖互动，一支 AI 团队把选题写成十多篇稿子，另一支 AI 团队把你眼前这个网站从需求建到上线。它们怎么分工、怎么记事、怎么复盘，13 篇工作日志全程留痕。',
    href: sitePaths.sceneAiLogs
  },
  {
    id: 'resume-site',
    label: '简历网站',
    tag: 'Zero Manual Code · 现场证据',
    status: '已交付上线',
    description: '一份我没写过一行代码的简历网站。需求我提，成品 AI 出——从零到上线，全程 AI 交付。',
    href: 'https://www.liutongxue.com.cn/',
    isExternal: true
  },
  {
    id: 'mini-program',
    label: '就喝1杯',
    tag: '趣味小程序 · 零糖零卡',
    status: '微信体验',
    description: '想喝奶茶又怕胖？来这里假装喝一杯：点单、摇杯、插吸管，仪式感拉满，糖分热量都是零。',
    href: sitePaths.scene
  }
];

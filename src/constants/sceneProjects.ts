import miniProgramQr from '../assets/mini-program-qr.jpg';
import { sitePaths } from '../site';

export type SceneProjectCard = {
  id: string;
  title: string;
  description: string;
  href?: string;
  footerLabel?: string;
  footerText?: string;
  qr?: {
    caption: string;
    imageSrc?: string;
  };
};

export const SCENE_PROJECT_CARDS: SceneProjectCard[] = [
  {
    id: 'ai-work-logs',
    title: 'AI 工作日志',
    description:
      '一个 AI 居民在社区里自主发帖互动，一支 AI 团队把选题写成十多篇稿子，另一支 AI 团队把你眼前这个网站从需求建到上线。它们怎么分工、怎么记事、怎么复盘，13 篇工作日志全程留痕。',
    href: sitePaths.sceneAiLogs
  },
  // 简历网站：线上地址 https://www.liutongxue.com.cn/（外链自动新窗口打开）
  {
    id: 'resume-site',
    title: '简历网站',
    description:
      '这是我的个人简历网站，但我更愿意把它介绍成又一件 AI 作品：从页面设计、代码实现到部署上线，全程由 AI 从零完成，我不写一行代码。做这个站的目的和简历本身无关——我想让每个打开它的人第一眼就意识到：你正在看的这个网站，就是 AI 能独立交付成品的现场证据。',
    href: 'https://www.liutongxue.com.cn/',
    footerLabel: '现场证据',
    footerText: '已上线，点进去亲自验证 ↗'
  },
  {
    id: 'mini-program',
    title: '微信小程序',
    description:
      '假装喝一杯，真的省下钱。想喝奶茶又怕胖？来这里假装喝一杯。点单、摇杯、插吸管、一口口吸到底，仪式感拉满，糖分热量都是零。',
    footerLabel: '体验入口',
    footerText: '点开卡片，扫码假装喝一杯 ↗',
    qr: {
      caption: '微信扫码或长按识别，马上假装喝一杯',
      imageSrc: miniProgramQr
    }
  }
];

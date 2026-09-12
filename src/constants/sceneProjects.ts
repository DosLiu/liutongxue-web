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
    footerLabel: '线上地址',
    footerText: '点击访问 ↗'
  },
  // 微信小程序：文案与小程序码图片待补充，图片放到 src/assets/ 后填入 qr.imageSrc
  {
    id: 'mini-program',
    title: '微信小程序',
    description: '',
    footerText: '点击卡片查看小程序码',
    qr: {
      caption: '微信扫码或长按识别，打开小程序'
    }
  }
];

import miniProgramQr from '../assets/mini-program-qr.jpg';
import { sitePaths } from '../site';
import { SCENE_LOGS_UNDER_MAINTENANCE } from '../data/scene/routes';

export type SceneProjectCard = {
  id: string;
  title: string;
  lead?: string;
  description: string;
  href?: string;
  footerLabel?: string;
  footerText?: string;
  /** 开启后卡片打上「检修中」宽腰带封条并禁用点击跳转 */
  underMaintenance?: boolean;
  /** 尚未上线的新项目预告位 */
  isPlaceholder?: boolean;
  qr?: {
    caption: string;
    imageSrc?: string;
  };
};

export const SCENE_PROJECT_CARDS: SceneProjectCard[] = [
  // 简历网站：线上地址 https://jianli.liutongxue.com.cn/（外链自动新窗口打开）
  {
    id: 'resume-site',
    title: '简历网站',
    lead: '从页面设计、代码实现到部署上线，全程由 AI 从零完成，我不写一行代码。',
    description:
      '这既是我的个人简历网站，也是 AI 能独立交付成品的现场证据——打开它，你正在看的这个网站本身就是答案。',
    href: sitePaths.resumeSite,
    footerLabel: '现场证据',
    footerText: '访问 jianli.liutongxue.com.cn'
  },
  {
    id: 'mini-program',
    title: '就喝1杯',
    lead: '假装喝一杯，真的省下钱，糖分和热量都是零。',
    description:
      '想喝奶茶又怕胖？来这里点单、摇杯、插吸管、一口口吸到底，把喝奶茶的仪式感拉满。',
    footerLabel: '体验入口',
    footerText: '扫码假装喝一杯',
    qr: {
      caption: '微信扫码或长按识别，马上假装喝一杯',
      imageSrc: miniProgramQr
    }
  },
  {
    id: 'new-project-placeholder',
    title: '新项目酝酿中',
    description: '下一个 AI 实验正在打磨，上线后将在此开放现场验证。',
    isPlaceholder: true
  },
  {
    id: 'ai-work-logs',
    title: 'AI 工作日志',
    lead: '三支 AI 团队如何分工、记事与复盘，13 篇工作日志全程留痕。',
    description:
      '一个 AI 居民自主发帖互动，一支团队写完十多篇稿子，另一支团队把你眼前这个网站从需求建到上线。',
    href: SCENE_LOGS_UNDER_MAINTENANCE ? undefined : sitePaths.sceneAiLogs,
    footerLabel: SCENE_LOGS_UNDER_MAINTENANCE ? '维护状态' : undefined,
    footerText: SCENE_LOGS_UNDER_MAINTENANCE ? '内容检修中，暂未开放' : undefined,
    underMaintenance: SCENE_LOGS_UNDER_MAINTENANCE
  }
];

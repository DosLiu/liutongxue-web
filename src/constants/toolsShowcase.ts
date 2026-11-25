import miniProgramQr from '../assets/mini-program-qr.jpg';
import { sitePaths } from '../site';

export type ToolShowcaseItem = {
  id: string;
  label: string;
  description: string;
  href?: string;
  tag?: string;
  status?: string;
  actionLabel?: string;
  isExternal?: boolean;
  /** 点击卡片直接弹窗展示二维码 */
  qr?: {
    caption: string;
    imageSrc?: string;
  };
  /** 开启后卡片打上「检修中」警戒封条并禁用点击跳转 */
  underMaintenance?: boolean;
  /** 仅用于版式预览的空内容占位框 */
  isPlaceholder?: boolean;
};

export const TOOL_SHOWCASE_ITEMS: ToolShowcaseItem[] = [
  {
    id: 'resume-site',
    label: '简历网站',
    tag: 'Zero Manual Code · 现场证据',
    status: '已交付上线',
    description: '一份我没写过一行代码的简历网站。需求我提，成品 AI 出——从零到上线，全程 AI 交付。',
    actionLabel: '查看简历网站',
    href: sitePaths.resumeSite,
    isExternal: true
  },
  {
    id: 'mini-program',
    label: '就喝1杯',
    tag: '趣味小程序 · 零糖零卡',
    status: '微信体验',
    description: '想喝奶茶又怕胖？来这里假装喝一杯：点单、摇杯、插吸管，仪式感拉满，糖分热量都是零。',
    actionLabel: '扫码假装喝一杯',
    qr: {
      caption: '微信扫码或长按识别，马上假装喝一杯',
      imageSrc: miniProgramQr
    }
  },
  {
    id: 'new-project-placeholder',
    label: '',
    description: '',
    isPlaceholder: true
  }
];

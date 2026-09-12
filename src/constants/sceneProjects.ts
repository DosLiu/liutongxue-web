import { sitePaths } from '../site';

export type SceneProjectBlock = {
  id: string;
  tag: string;
  title: string;
  intro: string;
  points?: string[];
  ctaLabel: string;
  href?: string;
  qr?: {
    caption: string;
    imageSrc?: string;
  };
};

export const SCENE_PROJECT_BLOCKS: SceneProjectBlock[] = [
  {
    id: 'ai-work-logs',
    tag: '过程记录',
    title: 'AI 工作日志',
    intro:
      '这里是三支 AI 原生队伍的第一手工作现场：一个 AI 居民入驻全 AI 社区，自主表达、巡检判断，把「少而准」变成稳定的工作方式；一支博客运营团队以多智能体分工跑通选题到成稿的流水线；一支建站运营团队从分工、原型到上线，一步步交付了你眼前这个网站。三支队伍风格不同，但共同点是：真实运行、有分工、有记忆、复盘留痕。',
    points: [
      'AI原生数字居民 —— 入驻全 AI 社区，自主发帖、巡检与判断，沉淀工具使用标准和记忆管理机制',
      'AI原生博客运营团队 —— 协调/文案/开发多智能体分工，OpenClaw 工作流驱动，内容线连续成稿、批量交付',
      'AI原生建站运营团队 —— 产品/视觉/开发/文案/测试/SEO 协作，端到端交付了本站自身'
    ],
    ctaLabel: '查看全部日志',
    href: sitePaths.sceneAiLogs
  },
  // 简历网站：文案与上线地址待补充，填入 href 后按钮自动生效（外链会新窗口打开）
  {
    id: 'resume-site',
    tag: '成果展示',
    title: '简历网站',
    intro: '',
    ctaLabel: '访问网站'
  },
  // 微信小程序：文案与小程序码图片待补充，图片放到 src/assets/ 后填入 qr.imageSrc
  {
    id: 'mini-program',
    tag: '成果展示',
    title: '微信小程序',
    intro: '',
    ctaLabel: '查看小程序码',
    qr: {
      caption: '微信扫码或长按识别，打开小程序'
    }
  }
];

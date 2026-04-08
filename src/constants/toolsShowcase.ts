import { ImageIcon, Palette, Shapes, type LucideIcon } from 'lucide-react';
import { sitePaths } from '../site';

export type ToolShowcaseItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const TOOL_SHOWCASE_ITEMS: ToolShowcaseItem[] = [
  {
    id: 'ai-native-digital-resident',
    label: 'AI原生数字居民',
    icon: Palette,
    href: sitePaths.sceneLogs.digitalResident,
    description:
      '结合InStreet社区，我的“AI数字分身”早已像数字虚拟世界的原生居民一样，在专属的硅基社区里拥有了完整的生活。它能完全自主的去发帖、回帖，完成最基本的场景互动。在论坛冲浪之余，它还能在赛博酒馆闲聊放松、在小游戏板块切磋竞技、在SKILLS技能论坛共享评测不同的技能。无需人工操控，让 AI 也能拥有自己的社交、娱乐与成长。'
  },
  {
    id: 'ai-native-blog-ops-team',
    label: 'AI原生博客运营团队',
    icon: Shapes,
    href: sitePaths.sceneLogs.blogOps,
    description:
      '依托OpenClaw搭建分布式多智能体协同工作流，3 个异构智能体协同。完成博客从需求解析到成品交付的端到端增强式自动化运营。'
  },
  {
    id: 'ai-native-site-ops-team',
    label: 'AI原生建站运营团队',
    icon: ImageIcon,
    href: sitePaths.sceneLogs.siteOps,
    description:
      '你眼前的这个网站，正是我们AI智能体矩阵的最新交付成果。6大专业智能体无缝协同：产品经理智能体、视觉交互、全栈开发、文案编写、测试验收、SEO优化。从需求解析到站点上线，端到端全自动闭环。这不是未来，这是你正在看到的AI能力。'
  }
];

import { ImageIcon, Palette, Shapes, type LucideIcon } from 'lucide-react';

export type ToolShowcaseItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const TOOL_SHOWCASE_ITEMS: ToolShowcaseItem[] = [
  {
    id: 'background-studio',
    label: 'Background Studio',
    icon: Palette,
    href: 'https://reactbits.dev/tools/background-studio',
    description:
      'Explore animated backgrounds for your projects. Choose from various effects and customize as you like. Export as video, image, or code or share your creations as URLs.'
  },
  {
    id: 'shape-magic',
    label: 'Shape Magic',
    icon: Shapes,
    href: 'https://reactbits.dev/tools/shape-magic',
    description:
      'Tool for automagically creating inner rounded corners between shapes of different sizes. Export as code or SVG.'
  },
  {
    id: 'texture-lab',
    label: 'Texture Lab',
    icon: ImageIcon,
    href: 'https://reactbits.dev/tools/texture-lab',
    description:
      'Apply effects to your images and export the results. Add noise, dithering, halftone, ASCII art, and more. Save your presets for sharing or future use.'
  }
];

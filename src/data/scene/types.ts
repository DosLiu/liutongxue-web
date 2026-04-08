export type SceneLogKey = 'digitalResident' | 'blogOps' | 'siteOps';

export type SceneLogEntry = {
  id: string;
  publishedAt: string;
  title: string;
  preview: string;
  summary: string;
  detailHref?: string;
  detailTitle?: string;
  detailContent?: string[];
  detailImageSrc?: string;
  detailImageAlt?: string;
  detailImageCaption?: string;
  sourceHref?: string;
  sourceLabel?: string;
};

export type SceneLogCollection = {
  key: SceneLogKey;
  title: string;
  subtitle: string;
  logs: SceneLogEntry[];
};

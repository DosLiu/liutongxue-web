export type SceneLogKey = 'digitalResident' | 'blogOps' | 'siteOps';

export type SceneLogPreview = {
  id: string;
  publishedAt: string;
  title: string;
  preview: string;
  summary: string;
  detailTitle?: string;
  seoTitle: string;
  seoDescription: string;
};

export type SceneLogDetail = {
  detailContent: string[];
  detailImageAlt?: string;
  detailImageCaption?: string;
  sourceHref?: string;
  sourceLabel?: string;
};

export type SceneLogEntry = SceneLogPreview &
  SceneLogDetail & {
    detailHref: string;
    detailImageSrc: string;
  };

export type SceneLogCollection = {
  key: SceneLogKey;
  title: string;
  subtitle: string;
  cardDescription: string;
  seoTitle: string;
  seoDescription: string;
  logs: SceneLogPreview[];
};

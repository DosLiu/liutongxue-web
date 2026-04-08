export type SceneLogKey = 'digitalResident' | 'blogOps' | 'siteOps';

export type SceneLogEntry = {
  id: string;
  publishedAt: string;
  title: string;
  summary: string;
};

export type SceneLogCollection = {
  key: SceneLogKey;
  title: string;
  subtitle: string;
  logs: SceneLogEntry[];
};

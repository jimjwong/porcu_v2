export interface ShortLink {
  id: string;
  originalUrl: string;
  shortUrl: string;
  userId: string;
  createdAt: number;
  clicks: number;
  title?: string;
}

export interface ClickEvent {
  id: string;
  linkId: string;
  timestamp: number;
  userAgent: string;
  referrer: string;
  country?: string;
  city?: string;
}

export interface AnalyticsData {
  totalClicks: number;
  clicksOverTime: { date: string; clicks: number }[];
  referrers: { name: string; count: number }[];
  browsers: { name: string; count: number }[];
}

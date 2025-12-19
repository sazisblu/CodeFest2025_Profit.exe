export interface Report {
  name: string;
  report: string;
  timeAgo: string;
  avatar: string;
  image: string | null;
}

export interface Issue {
  id: string;
  image: string;
  title: string;
  location: string;
  category: string;
  categoryColor: string;
  priority: number;
  status: string;
  statusColor: string;
  submitted: string;
  description: string;
  likes?: number;
  commentCount?: number;
  reportsCount: number;
  engagement: string;
  timeAgo: string;
  recentReports: Report[];
}

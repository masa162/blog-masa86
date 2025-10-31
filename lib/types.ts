export interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface DbPost {
  id: number;
  slug: string;
  title: string;
  content: string;
  tags: string; // JSON string
  created_at: string;
  updated_at: string;
}


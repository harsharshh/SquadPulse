export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: Date;
}

export type Category = "general" | "praise" | "concern" | "idea" | "fun";

export interface Whisper {
  id: string;
  text: string;
  timestamp: Date;
  category: Category;
  likes: number;
  shares: number;
  comments: Comment[];
  likedByMe?: boolean;
  mine?: boolean;
}

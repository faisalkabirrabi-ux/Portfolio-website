export interface TimelineItem {
  id: number;
  title: string;
  description: string;
}

export interface GalleryItem {
  id: number;
  imageUrl: string;
  title: string;
}

export interface FamilyMember {
  id: number;
  name: string;
  relation: string;
  description: string;
  imageUrl: string;
}

export interface UpdatePost {
  id: number;
  date: string;
  content: string;
}

export interface Chapter {
  title: string;
  content: string;
  detailed_notes: string;
  order_index: number;
  video_id?: string | null;
}

export interface Module {
  title: string;
  description: string | null;
  chapters: Chapter[];
}

export interface GeneratedCourse {
  title: string;
  description: string;
  modules: Module[];
}

export interface Topic {
  id: number;
  topic_name: string;
  topic_description?: string;
}

export const SourceStatus = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed"
} as const;
export type SourceStatus = (typeof SourceStatus)[keyof typeof SourceStatus];

export interface KnowledgeSource {
  id: number;
  title: string;
  status: SourceStatus;
  topic?: Topic;
  //  остальные поля
}

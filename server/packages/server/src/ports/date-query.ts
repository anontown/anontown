export type DateType = "gt" | "gte" | "lt" | "lte";

export interface DateQuery {
  date: string;
  type: DateType;
}

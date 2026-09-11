export interface Card {

  id: string;

  columnId: string;

  title: string;

  description: string;

  position: number;

  dueDate: string | null;

  createdAt: string;
}

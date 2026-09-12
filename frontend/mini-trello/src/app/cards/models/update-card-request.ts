export interface UpdateCardRequest {

  columnId: string;

  title: string;

  description: string;

  position: number;

  dueDate: string | null;
}

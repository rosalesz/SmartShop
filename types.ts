
export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  createdAt: number;
}

export interface Product {
  id: string;
  listId: string;
  userId: string;
  name: string;
  price: number;
  store: string;
  link: string;
  createdAt: number;
}

export type ViewState = 'landing' | 'auth' | 'dashboard' | 'list_detail';

export interface AppState {
  view: ViewState;
  selectedListId: string | null;
}

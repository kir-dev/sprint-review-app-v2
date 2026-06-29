export interface EventCategory {
  id: number;
  name: string;
  label: string;
  color: string;
}

export interface Event {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  categoryId: number;
  category?: EventCategory;
  _count?: {
    logs: number;
  };
}

export interface EventFormData {
  name: string;
  startDate: string;
  endDate: string;
  categoryId: number | string;
}

// import { SortDirection } from './category';
export enum SortDirection {
  Ascending = 0,
  Descending = 1,
}
export interface PaginatedResponse<T> {
  pageSize: number;
  pageIndex: number;
  totalCount: number;
  data: T[];
}

export interface Result {
  isSuccess: boolean;
  message: string;
}
export interface Product {
  id: number;
  name: string;
  description: string;
  additionalAttributes?: string | null; // JSON string
  status: string; // Corrected type from string to statusEnum
  brand: string; // Corrected typo from "brabd" to "brand"
  model: string; // Corrected typo from "modle" to "model"
  quantity: number; // Corrected typo from "qunatity" to "quantity"
  mainImageURL?: string | null;
  imagePublicId?: string | null;
  categoryId: number;
  categoryName?: string | null;
  createdAt: string; // ISO date string
  productMedia: ProductMedia[]; // Array of image or video media
}

export interface ProductMedia {
  id?: number;
  mediaURL?: string | null; // URL for image or video
  imageThumbnailURL?: string | null; // Thumbnail for images or videos (if applicable)
  mediaPublicId?: string | null;
  mediaType?: 'image' | 'video' | 'pdf' | null; // Added to distinguish media type
}

export enum SortProp {
  Id = 0,
  Name = 1,
  Description = 2,
  Price = 3,
  Status = 4,
  CategoryId = 5,
  CreatedAt = 6,
}
export enum statusEnum {
  lease = 'إيجار',
  purchase = 'شراء',
  both = 'إيجار وشراء',
}
export interface ProductParams {
  search?: string | null;
  description?: string | null;
  attributesFilter?: Record<string, string> | null;
  categoryId?: number | null;
  status?: string | null;
  brand?: string | null;
  model?: string | null;
  quantity?: number | null;
  sortProp?: SortProp | null;
  sortDirection?: SortDirection | null;
  pageIndex: number;
  pageSize: number ;
}

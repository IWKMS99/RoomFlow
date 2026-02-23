export interface AdminRoom {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  isActive: boolean;
}

export interface RoomFile {
  id: string;
  fileKey: string;
  originalName: string;
  contentType: string;
  size: number;
  url: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  sort: string;
}

export interface AdminRoomsFilters {
  page: number;
  size: number;
  search?: string;
  floor?: number;
  minCapacity?: number;
  sort?: string;
}

export interface CreateAdminRoomPayload {
  name: string;
  floor: number;
  capacity: number;
}

export interface UpdateAdminRoomPayload {
  name: string;
  floor: number;
  capacity: number;
}

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
  requestId: string;
};

export type ApiFailure = {
  success: false;
  code: string;
  message: string;
  requestId?: string;
};

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export type ResourceList<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

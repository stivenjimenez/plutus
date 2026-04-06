export interface ApiError {
  error: string
  code?: string
}

export type ApiResponse<T> = T | ApiError

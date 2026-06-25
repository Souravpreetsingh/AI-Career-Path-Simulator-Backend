export interface StandardResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export class ApiResponse {
  static success<T>(data?: T, message = 'Success'): StandardResponse<T> {
    return { success: true, message, data };
  }

  static created<T>(data?: T, message = 'Created successfully'): StandardResponse<T> {
    return { success: true, message, data };
  }

  static noContent(message = 'Deleted successfully'): StandardResponse<null> {
    return { success: true, message, data: null };
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message = 'Success',
  ): StandardResponse<{ items: T[]; total: number; page: number; limit: number; totalPages: number }> {
    return {
      success: true,
      message,
      data: {
        items: data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}

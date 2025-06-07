export const responseHandler = {
  ok: (data: any) => {
    return {
      success: true,
      data,
      status: 200,
      message: 'SUCCESS!',
    };
  },

  notFound: () => {
    return {
      success: false,
      status: 404,
      message: 'CANNOT FIND RESOURCES!',
    };
  },

  error: (message?: string) => {
    return {
      success: false,
      status: 500,
      message: message || 'Internal server error',
    };
  },

  unauthorized: (message?: string) => {
    return {
      success: false,
      status: 401,
      message: message || 'Unauthorized',
    };
  },

  invalidated: (errors: any) => {
    return {
      success: false,
      status: 422,
      data: errors,
    };
  },
};

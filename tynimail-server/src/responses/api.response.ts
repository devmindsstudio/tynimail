export const success = (message = "Success" , data: any,) => ({
    success: true,
    message,
    ...data,
});

export const error = (message = 'Error', errorType="INTERNAL-SERVER-ERROR", data: any = undefined) => ({
    success: false,
    errorType,
    message,
    ...(data && typeof data === 'object' ? data : { data }),
});
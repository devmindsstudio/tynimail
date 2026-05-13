import { validate } from 'deep-email-validator'

export const validateEmail = async (email: string): Promise<boolean> => {
    try {
        const result = await validate({
            email,
            validateRegex: true,
            validateMx: true,
            validateTypo: true,
            validateDisposable: true,
            validateSMTP: true,
        });
        return result.valid;
    } catch (error) {
        return false; // Assume invalid if there's an error
    }
}
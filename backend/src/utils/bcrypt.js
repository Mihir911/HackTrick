import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

//hash password
export const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        return await bcrypt.hash(password, salt);
    } catch (error) {
        throw new Error(`Password hashing failed: ${error.message}`);

    }
};

//verify password against hash
export const verifyPassword = async (password, hash) => {
    try {
        return await bcrypt.compare(password, hash);
    } catch (error) {
        return false;
    }
};

export default { hashPassword, verifyPassword };
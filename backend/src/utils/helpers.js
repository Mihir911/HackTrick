import { v4 as uuidv4 } from 'uuid';

/**
 * get current timestamp in ISO format
 */
export const nowISO = () =>{
    return new Date().toISOString();
};

//cleaning document by remving sensitive fields
export const cleanDocument = (doc) =>  {
    if (!doc) return null;
    const cleaned = { ...doc };
    delete cleaned._id;
    delete cleaned.__v;
    delete cleaned.password_hash;
    return cleaned;
};


//generate a new random ID
export const generateId = () => {
    return uuidv4();
};

//check if string is valid json
export const isValidJSON = (str) => {
    try {
        JSON.parse(str);
        return true;
    } catch (error) {
        return false;
    }
};

//capitalize FIrst latter
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

//truncate string to a max length
export const truncate = (str, maxLength = 100) => {
    if (!str || str.length <= maxLength) return str;
    return str.slice(0, maxLength) + '...';
};

export default {
    nowISO,
    cleanDocument,
    generateId,
    isValidJSON,
    capitalize,
    truncate
};
import axios from 'axios';
import logger from '../utils/logger.js';

const STORAGE_URL = process.env.STORAGE_URL;

const EMERGENT_KEY = process.env.EMERGENT_LLM_KEY;

let storageKey = null;

export const initStorage = async () => {
    if (storageKey) return storageKey;

    try {
        const response = await axios.post(
            `${STORAGE_URL}/init`,
            { emergent_key: EMERGENT_KEY },
            { timeout: 30000}
        );

        storageKey = response.data.storage_key;
        logger.info('Storage initialized successfully');
        return storageKey;
    } catch (error) {
        logger.warn(`Storage init failed (non-fatal): ${error.message}`);
        return null;
    }
};

export const putObject = async (path, data, contentType) => {
    const key = await initStorage();
    if (!key) throw new Error('Storage not initialized');

    try {
        const response = await axios.put(
            `${STORAGE_URL}/objects/${path}`,
            data,
            {
                headers: {
                    'X-Storage-Key': key,
                    'Content-Type': contentType || 'application/octet-stream'
                },
                timeout: 180000
            }
        );
        return response.data;
    } catch (error) {
        logger.error(`Storage upload failed: ${error.message}`);
        throw error;
    }
};

export const getObject = async (path) => {
    const key = await initStorage();
    if (!key) throw new Error('Storage not initialized');

    try {
        const response = await axios.get(
            `${STORAGE_URL}/objects/${path}`,
            {
                headers: { 'X-Storage-Key': key },
                timeout: 60000,
                responseType: 'arraybuffer'
            }
        );
        return {
            data: response.data,
            contentType: response.headers['content-type'] || 'application/octet-stream'

        };
    } catch (error) {
        logger.error(`Storage download failed: ${error.message}`);
        throw error;
    }
};

export default { initStorage, putObject, getObject };
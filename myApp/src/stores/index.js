import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { getStorageSync, setStorageSync, removeStorageSync } from '@tarojs/taro';

const pinia = createPinia()
pinia.use(
    createPersistedState({
        storage: {
            getItem(key) {
                return getStorageSync(key);
            },
            setItem(key, value) {
                setStorageSync(key, value);
            },
            removeItem(key) {
                removeStorageSync(key);
            },
        },
    })
);

export default pinia

export * from './modules/user'
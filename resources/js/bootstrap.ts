// resources/js/bootstrap.ts
import axios from 'axios';

// Extend Window interface untuk axios
declare global {
    interface Window {
        axios: typeof axios;
    }
}

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

class Config {
    _restURL = "";
    _authToken = "";

    constructor() {
        this.reload();
    }

    reload() {
        this._restURL = this.retrieve('restURL') || "";
        this._authToken = this.retrieve('authToken') || "";
        this._wsEndpoint = this.retrieve('wsEndpoint') || "";
    }

    retrieve(key) {
        const url = new URL(window.location.href);
        return url.searchParams.get(key);
    }

    save(key, val) {
        const url = new URL(window.location.href);
        url.searchParams.set(key, val);
        window.history.pushState({}, '', url);
    }

    set wsEndpoint(val) {
        this.save('wsEndpoint', val);
    }
    get wsEndpoint() {
        return this.retrieve('wsEndpoint');
    }

    set restURL(val) {
        this.save('apiEndpoint', val);
    }
    get restURL() {
        return this.retrieve('apiEndpoint');
    }

    set authCode(val) {
        this.authToken = val;
    }
    set authToken(val) {
        this._authToken = val;
        this.save('apiToken', val);
    }
    get authToken() {
        return this.retrieve('apiToken');
    }
}

const config = new Config();

export default config;

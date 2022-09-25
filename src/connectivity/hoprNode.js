import { NetworkError } from '../errors.js';
import config from '../config/config.js';
import { getHeaders } from './getHeaders.js';

function hoprNodeHttpUrl() {
    let url = config.restURL;

    if(url && url.length > 1) {
        if(url[url.length - 1] == '/')
            url = url.substring(0, url.length - 1);
        return url;
    } else return false;
}

function callAPI(path, body) {
    const hopr_node_http_url = hoprNodeHttpUrl();
    const authToken = config.authToken;

    let method = 'GET';
    if(body)
        method = 'POST';

    const headers = getHeaders(authToken, method == 'POST');

    const fetchConfig = {
        headers,
        method,
        ...body && {body: JSON.stringify(body)}
    };

    return fetch(`${hopr_node_http_url}/api/v2/${path}`, fetchConfig)
        .then(res => {
            return res.json()
                .then(jsonRes => {
                    if(res.ok)
                        return jsonRes;
                    else {
                        let errorMessage = res.statusText;

                        if(jsonRes.error)
                            errorMessage += " - " + jsonRes.error;
                        else
                            console.error(jsonRes);

                        throw new NetworkError(errorMessage);
                    }
                });
        })
}

export function getAddress() {
    if(hoprNodeHttpUrl()) {
        return callAPI('account/address')
            .then(res => {
                return res.hoprAddress;
            });
    }
    else return Promise.resolve(null);
}

export function establishChannel(hoprAddr, type='incoming', amount=10000000) {
    const body = {
        type,
        peerID: hoprAddr,
        amount
    }

    return callAPI('channels', body);
}

export function sendHoprMessage(hoprAddr, message, path) {
    if(!path)
        path = [ hoprAddr ];
    if(hoprNodeHttpUrl()) {
        const body = {
            recipient: hoprAddr,
            body: message,
            path,
        };
        return callAPI('messages', body)
    }
}

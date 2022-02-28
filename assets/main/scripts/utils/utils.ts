export function sleep(time: number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(time);
        }, time * 1000);
    });
}

export function genRandomStr() {
    return Math.random().toString().replace('0.', '');
}

let param_map: { [key: string]: string };
export function getParams(key: string) {
    if (!param_map) {
        param_map = {};
        window.location.href.replace(
            /[?&]+([^=&]+)=([^&]*)/gi,
            (m, _key, value) => {
                param_map[_key] = value;
                return value;
            },
        );
    }
    return param_map[key];
    // return true;
}

export function tplStr<T extends Record<string, unknown>>(
    str: string,
    data?: T,
) {
    for (const key in data) {
        str = str.replace(new RegExp(`{${key}}`, 'g'), data[key] + '');
    }

    return str;
}

import { getParams } from '../utils/utils';

export function checkLocalTest() {
    if (getParams('localTest') === 'yes') {
        localTestDepend();
        return true;
    }

    return false;
}

function localTestDepend() {
    paladin.sys.config.ws = 'ws://172.16.6.184:7020/ws';
    paladin.getGameId = () => '10012';
    paladin.getCurrency = () => 'USDT';
}

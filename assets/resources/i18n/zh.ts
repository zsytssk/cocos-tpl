// 通用
import Common from '../locales/zh/common';

const win = window as any;

export const languages = {
    Common,
};

if (!win.languages) {
    win.languages = {};
}

win.languages['zh'] = languages;

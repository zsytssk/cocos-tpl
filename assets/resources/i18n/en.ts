// 通用
import Common from '../locales/en/common';

const win = window as any;

export const languages = {
    Common,
};

if (!win.languages) {
    win.languages = {};
}

win.languages['en'] = languages;

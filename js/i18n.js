// Two languages: 繁體中文 and English. The game starts in the language of the browser and remembers a change.
const LKEY = 'tenbrothers.lang';
let lang = (() => { try { const v = localStorage.getItem(LKEY); if (v === 'zh' || v === 'en') return v; } catch (e) {} return /^zh/i.test(navigator.language || '') ? 'zh' : 'en'; })();
document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
export const getLang = () => lang;
export function setLang(l) { lang = l; try { localStorage.setItem(LKEY, l); } catch (e) {} document.documentElement.lang = l === 'zh' ? 'zh-Hant' : 'en'; }
export const isEn = () => lang === 'en';
// a string in each language
export const tr = (zh, en) => (lang === 'en' ? en : zh);
// the brothers and the levels in the current language
export const bTitle = (d) => (isEn() ? d.en.title : d.zh);
export const bSkill = (d) => (isEn() ? d.en.skill : d.skill);
export const bDesc = (d) => (isEn() ? d.en.desc : d.desc);
export const bWho = (d) => `${d.name} ${bTitle(d)}`;
export const bRank = (d) => (isEn() ? ['Eldest', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', 'Youngest'][d.n - 1] : '老' + '一二三四五六七八九十'[d.n - 1]);
export const lName = (L) => (isEn() ? L.en.name : L.name);
export const lIntro = (L) => (isEn() ? L.en.intro : L.intro);
export const lHint = (L) => (isEn() ? L.en.hint : L.hint);

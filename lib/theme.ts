export type ThemeId = 'navy-cyan' | 'slate-lime' | 'coral-glow' | 'dusk-lavender' | 'steel-mist';

export const themes: { id: ThemeId; label: string; bg: string; accent: string }[] = [
    { id: 'navy-cyan',      label: 'Navy Cyan',      bg: '#0b132b', accent: '#6fffe9' },
    { id: 'slate-lime',     label: 'Slate Lime',     bg: '#020617', accent: '#bef264' },
    { id: 'coral-glow',     label: 'Coral Glow',     bg: '#1c1410', accent: '#f4845f' },
    { id: 'dusk-lavender',  label: 'Dusk Lavender',  bg: '#16121e', accent: '#b6a6ca' },
    { id: 'steel-mist',     label: 'Steel Mist',     bg: '#0d1618', accent: '#a5ccd1' },
];

const STORAGE_KEY = 'admin-theme';

export function applyTheme(id: ThemeId) {
    if (id === 'navy-cyan') {
        delete document.documentElement.dataset.theme;
    } else {
        document.documentElement.dataset.theme = id;
    }
    localStorage.setItem(STORAGE_KEY, id);
}

export function loadSavedTheme(): ThemeId {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    const valid = saved && themes.some(t => t.id === saved);
    return valid ? saved : 'navy-cyan';
}

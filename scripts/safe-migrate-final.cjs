/**
 * Final cleanup pass — handles remaining unmapped icons and any patterns
 * the previous passes missed. Still LINE-SAFE.
 */
const fs = require('fs');
const path = require('path');

const EXTRA_MAP = {
    'search_off': 'SearchX',
    'work_off': 'BriefcaseX', // doesn't exist in lucide — use custom
    'local_fire_department': 'Flame',
    'ac_unit': 'Snowflake',
    'bookmark_border': 'Bookmark',
    'keyboard_arrow_down': 'ChevronDown',
    'keyboard_arrow_up': 'ChevronUp',
    'domain': 'Building2',
};

// Some icons don't exist in lucide-react — map to closest alternatives
const FALLBACK_MAP = {
    'work_off': 'Briefcase',
    'search_off': 'SearchX',
};

const ICON_MAP = {
    'close': 'X', 'arrow_back': 'ArrowLeft', 'arrow_forward': 'ArrowRight',
    'chevron_right': 'ChevronRight', 'chevron_left': 'ChevronLeft',
    'expand_more': 'ChevronDown', 'expand_less': 'ChevronUp',
    'search': 'Search', 'refresh': 'RefreshCw', 'download': 'Download',
    'upload': 'Upload', 'content_copy': 'Copy', 'delete': 'Trash2',
    'edit': 'Pencil', 'add': 'Plus', 'remove': 'Minus',
    'check': 'Check', 'check_circle': 'CheckCircle', 'error': 'AlertCircle',
    'warning': 'AlertTriangle', 'info': 'Info', 'pending': 'Clock',
    'visibility': 'Eye', 'visibility_off': 'EyeOff', 'description': 'FileText',
    'settings': 'Settings', 'dashboard': 'LayoutDashboard',
    'sync': 'RefreshCw', 'cloud_upload': 'CloudUpload',
    'notifications': 'Bell', 'auto_awesome': 'Sparkles',
    'key_off': 'KeyRound', 'search_check': 'Search',
    'edit_note': 'NotebookPen',
    ...EXTRA_MAP, ...FALLBACK_MAP,
};

// Quick check for SearchX — it might not exist in lucide-react
// Use Search as fallback
ICON_MAP['search_off'] = 'Search';
ICON_MAP['work_off'] = 'Briefcase';

const COMPONENT_DIR = path.join(__dirname, '..', 'components');
let totalFixed = 0;

function getAllTsxFiles(dir) {
    const r = [];
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const f = path.join(dir, e.name);
        if (e.isDirectory()) r.push(...getAllTsxFiles(f));
        else if (e.name.endsWith('.tsx')) r.push(f);
    }
    return r;
}

for (const filePath of getAllTsxFiles(COMPONENT_DIR)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('material-symbols-outlined')) continue;

    const usedIcons = new Set();
    let fileCount = 0;

    // Single-line pass
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.includes('material-symbols-outlined')) continue;

        // also handle style= attributes (ScholarshipFinder has style={{ fontSize }})
        const match = line.match(
            /<span\s+className=(?:["']|{`)[^"'`]*material-symbols-outlined[^"'`]*(?:["']|`})\s*(?:style=\{[^}]*\}\s*)?>(\w+)<\/span>/
        );
        if (!match) continue;

        const iconName = match[1];
        const lucide = ICON_MAP[iconName];
        if (!lucide) continue;

        let size = 20;
        const sizeMatch = line.match(/text-\[(\d+)px\]/) || line.match(/fontSize:\s*'(\d+)px'/);
        if (sizeMatch) size = parseInt(sizeMatch[1]);
        else if (line.includes('text-6xl')) size = 48;
        else if (line.includes('text-4xl')) size = 36;
        else if (line.includes('text-3xl')) size = 30;
        else if (line.includes('text-sm')) size = 14;

        const colorMatches = line.match(/(?:(?:dark|group-hover):)?text-(?![\[(])[a-zA-Z][\w/-]*/g) || [];
        const colors = colorMatches
            .filter(c => !c.match(/text-(sm|xs|lg|xl|2xl|3xl|4xl|5xl|6xl|base|center|left|right)/))
            .filter(c => !c.includes('material'));
        const animMatches = line.match(/animate-\w+/g) || [];
        const extras = [...colors, ...animMatches];
        const cls = extras.length > 0 ? ` className="${extras.join(' ')}"` : '';

        lines[i] = line.replace(match[0], `<${lucide} size={${size}}${cls} />`);
        usedIcons.add(lucide);
        fileCount++;
        totalFixed++;
    }
    content = lines.join('\n');

    // Multiline pass
    content = content.replace(
        /<span\s+className=(?:["']|{`)[^"'`]*material-symbols-outlined[^"'`]*(?:["']|`})\s*(?:style=\{[^}]*\}\s*)?>\s*\n\s*(\w+)\s*\n\s*<\/span>/g,
        (match, iconName) => {
            const lucide = ICON_MAP[iconName];
            if (!lucide) return match;

            let size = 20;
            const sizeMatch = match.match(/text-\[(\d+)px\]/);
            if (sizeMatch) size = parseInt(sizeMatch[1]);
            else if (match.includes('text-4xl')) size = 36;
            else if (match.includes('text-3xl')) size = 30;
            else if (match.includes('text-sm')) size = 14;

            const colorMatches = match.match(/(?:(?:dark|group-hover):)?text-(?![\[(])[a-zA-Z][\w/-]*/g) || [];
            const colors = colorMatches
                .filter(c => !c.match(/text-(sm|xs|lg|xl|2xl|3xl|4xl|5xl|6xl|base|center|left|right)/))
                .filter(c => !c.includes('material'));
            const animMatches = match.match(/animate-\w+/g) || [];
            const extras = [...colors, ...animMatches];
            const cls = extras.length > 0 ? ` className="${extras.join(' ')}"` : '';

            usedIcons.add(lucide);
            fileCount++;
            totalFixed++;
            return `<${lucide} size={${size}}${cls} />`;
        }
    );

    if (fileCount > 0) {
        if (content.includes("from 'lucide-react'")) {
            content = content.replace(
                /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"];?/,
                (m, existing) => {
                    const names = existing.split(',').map(s => s.trim()).filter(Boolean);
                    const merged = [...new Set([...names, ...usedIcons])].sort();
                    return `import { ${merged.join(', ')} } from 'lucide-react';`;
                }
            );
        } else {
            const sorted = [...usedIcons].sort();
            const importLine = `import { ${sorted.join(', ')} } from 'lucide-react';`;
            const lastImport = content.lastIndexOf('\nimport ');
            if (lastImport !== -1) {
                const end = content.indexOf('\n', lastImport + 1);
                content = content.slice(0, end + 1) + importLine + '\n' + content.slice(end + 1);
            }
        }
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${path.basename(filePath)}: ${fileCount}`);
    }
}

console.log(`\nFinal pass: ${totalFixed} more icons fixed`);

let remaining = 0;
for (const f of getAllTsxFiles(COMPONENT_DIR)) {
    const c = fs.readFileSync(f, 'utf8');
    const m = c.match(/material-symbols-outlined/g);
    if (m) { remaining += m.length; console.log(`⚠️  ${path.basename(f)}: ${m.length}`); }
}
console.log(`\nFinal remaining: ${remaining}`);

/**
 * SAFE multiline migration — handles 2-3 line span patterns ONLY.
 * Pattern:
 *   <span className="material-symbols-outlined ...">
 *     iconName
 *   </span>
 * 
 * NEVER touches dynamic content ({item.icon}, ternaries, etc.)
 */
const fs = require('fs');
const path = require('path');

const ICON_MAP = {
    'close': 'X', 'arrow_back': 'ArrowLeft', 'arrow_forward': 'ArrowRight',
    'chevron_right': 'ChevronRight', 'chevron_left': 'ChevronLeft',
    'expand_more': 'ChevronDown', 'expand_less': 'ChevronUp',
    'menu': 'Menu', 'open_in_new': 'ExternalLink', 'search': 'Search',
    'refresh': 'RefreshCw', 'download': 'Download', 'upload': 'Upload',
    'content_copy': 'Copy', 'delete': 'Trash2', 'edit': 'Pencil',
    'add': 'Plus', 'remove': 'Minus', 'person': 'User', 'people': 'Users',
    'group': 'Users', 'groups': 'Users', 'logout': 'LogOut', 'lock': 'Lock',
    'shield': 'Shield', 'check': 'Check', 'check_circle': 'CheckCircle',
    'error': 'AlertCircle', 'warning': 'AlertTriangle', 'info': 'Info',
    'pending': 'Clock', 'visibility': 'Eye', 'visibility_off': 'EyeOff',
    'description': 'FileText', 'mail': 'Mail', 'send': 'Send',
    'notifications': 'Bell', 'share': 'Share2', 'school': 'GraduationCap',
    'book_2': 'BookOpen', 'book': 'Book', 'emoji_events': 'Trophy',
    'lightbulb': 'Lightbulb', 'work': 'Briefcase', 'trending_up': 'TrendingUp',
    'trending_down': 'TrendingDown', 'analytics': 'BarChart3',
    'settings': 'Settings', 'dashboard': 'LayoutDashboard', 'home': 'Home',
    'dark_mode': 'Moon', 'light_mode': 'Sun', 'language': 'Globe',
    'star': 'Star', 'favorite': 'Heart', 'location_on': 'MapPin',
    'calendar_today': 'Calendar', 'save': 'Save', 'bolt': 'Zap',
    'plagiarism': 'ScanSearch', 'code': 'Code', 'link': 'Link',
    'arrow_downward': 'ArrowDown', 'arrow_upward': 'ArrowUp',
    'shield_person': 'ShieldCheck', 'radio_button_checked': 'Circle',
    'assignment_turned_in': 'ClipboardCheck', 'progress_activity': 'Loader2',
    'notifications_off': 'BellOff', 'redeem': 'Gift', 'security': 'ShieldCheck',
    'pending_actions': 'Clock', 'monetization_on': 'DollarSign',
    'person_add': 'UserPlus', 'group_add': 'UserPlus', 'person_off': 'UserX',
    'work_outline': 'Briefcase', 'co_present': 'Users', 'key_off': 'KeyRound',
    'list_alt': 'ListChecks', 'business': 'Building2', 'data_usage': 'PieChart',
    'grid_view': 'LayoutGrid', 'upload_file': 'FileUp', 'format_quote': 'Quote',
    'publish': 'Upload', 'class': 'BookOpen', 'hourglass_top': 'Hourglass',
    'calendar_month': 'CalendarDays', 'route': 'Route',
    'work_history': 'Briefcase', 'person_search': 'UserSearch',
    'smart_display': 'Monitor', 'bar_chart': 'BarChart3', 'pie_chart': 'PieChart',
    'account_balance_wallet': 'Wallet', 'credit_card': 'CreditCard',
    'payments': 'CreditCard', 'receipt_long': 'Receipt', 'savings': 'PiggyBank',
    'attach_money': 'DollarSign', 'money': 'DollarSign', 'show_chart': 'LineChart',
    'leaderboard': 'BarChart3', 'monitoring': 'Activity', 'article': 'FileText',
    'chat': 'MessageCircle', 'forum': 'MessageSquare', 'rate_review': 'Star',
    'videocam': 'Video', 'key': 'Key', 'manage_accounts': 'UserCog',
    'badge': 'BadgeCheck', 'verified_user': 'ShieldCheck',
    'track_changes': 'Target', 'auto_awesome': 'Sparkles',
    'fact_check': 'ClipboardCheck', 'support_agent': 'Headset',
    'block': 'Ban', 'report': 'OctagonAlert', 'flag': 'Flag',
    'thumb_up': 'ThumbsUp', 'thumb_down': 'ThumbsDown',
    'bookmark': 'Bookmark', 'assignment': 'ClipboardList',
    'task': 'ListTodo', 'event': 'CalendarDays', 'history': 'History',
    'verified': 'BadgeCheck', 'new_releases': 'Sparkles',
    'notifications_active': 'BellRing', 'call': 'Phone', 'place': 'MapPin',
    'today': 'CalendarCheck', 'access_time': 'Clock', 'timer': 'Timer',
    'schedule': 'Clock', 'image': 'Image', 'photo_camera': 'Camera',
    'attachment': 'Paperclip', 'folder': 'Folder', 'folder_open': 'FolderOpen',
    'help': 'HelpCircle', 'hourglass_empty': 'Hourglass',
    'done': 'Check', 'done_all': 'CheckCheck', 'account_circle': 'UserCircle',
    'login': 'LogIn', 'lock_open': 'Unlock', 'admin_panel_settings': 'ShieldCheck',
    'construction': 'Wrench', 'build': 'Wrench', 'rocket_launch': 'Rocket',
    'speed': 'Gauge', 'cloud_upload': 'CloudUpload', 'cloud_download': 'CloudDownload',
    'translate': 'Languages', 'public': 'Globe', 'add_circle': 'PlusCircle',
    'remove_circle': 'MinusCircle', 'cancel': 'XCircle',
    'sync': 'RefreshCw', 'search_check': 'Search', 'edit_note': 'NotebookPen',
    'unpublished': 'EyeOff', 'corporate_fare': 'Building2', 'menu_book': 'BookOpen',
    'filter_list': 'Filter', 'sort': 'ArrowUpDown', 'more_vert': 'MoreVertical',
    'domain': 'Building2', 'inventory_2': 'Package', 'local_shipping': 'Truck',
    'storefront': 'Store', 'apartment': 'Building', 'real_estate_agent': 'Home',
    'policy': 'FileWarning', 'gavel': 'Scale',
    'medical_services': 'Heart', 'psychology': 'Brain',
    'engineering': 'Wrench', 'science': 'FlaskConical',
    'edit_calendar': 'CalendarDays', 'content_paste': 'ClipboardPaste',
};

const COMPONENT_DIR = path.join(__dirname, '..', 'components');
let totalFixed = 0;
let filesFixed = 0;

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

    // Pattern: multiline span with static icon name
    // <span\s+className="...material-symbols-outlined..."\s*>\s*\n\s*iconName\s*\n\s*</span>
    content = content.replace(
        /<span\s+className=(?:["']|{\`)[^"'`]*material-symbols-outlined[^"'`]*(?:["']|\`})\s*>\s*\n\s*(\w+)\s*\n\s*<\/span>/g,
        (match, iconName) => {
            const lucide = ICON_MAP[iconName];
            if (!lucide) {
                console.warn(`  ⚠️  Unknown ML: "${iconName}" in ${path.basename(filePath)}`);
                return match;
            }

            let size = 20;
            const sizeMatch = match.match(/text-\[(\d+)px\]/);
            if (sizeMatch) size = parseInt(sizeMatch[1]);
            else if (match.includes('text-4xl')) size = 36;
            else if (match.includes('text-3xl')) size = 30;
            else if (match.includes('text-2xl')) size = 24;
            else if (match.includes('text-xl')) size = 20;
            else if (match.includes('text-lg')) size = 18;
            else if (match.includes('text-sm')) size = 14;
            else if (match.includes('text-xs')) size = 12;

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
        // Add/merge imports
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
        filesFixed++;
        console.log(`✅ ${path.basename(filePath)}: ${fileCount} multiline icons`);
    }
}

console.log(`\nMultiline pass: ${totalFixed} icons in ${filesFixed} files`);

let remaining = 0;
for (const f of getAllTsxFiles(COMPONENT_DIR)) {
    const c = fs.readFileSync(f, 'utf8');
    const m = c.match(/material-symbols-outlined/g);
    if (m) { remaining += m.length; console.log(`⚠️  ${path.basename(f)}: ${m.length}`); }
}
console.log(`Remaining: ${remaining}`);

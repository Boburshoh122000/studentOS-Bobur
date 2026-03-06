/**
 * Role-aware navigation utilities.
 * Returns the correct dashboard/settings path based on the user's role.
 */

export function getDashboardPath(role?: string): string {
    switch (role) {
        case 'ADMIN':
            return '/console-admin/dashboard';
        case 'EMPLOYER':
            return '/console-employer/dashboard';
        default:
            return '/app';
    }
}

export function getSettingsPath(role?: string): string {
    switch (role) {
        case 'ADMIN':
            return '/console-admin/settings';
        case 'EMPLOYER':
            return '/console-employer/settings';
        default:
            return '/app/settings';
    }
}

/**
 * Returns a user-friendly label for the dashboard link.
 */
export function getDashboardLabel(role?: string): string {
    switch (role) {
        case 'ADMIN':
            return 'Admin Console';
        case 'EMPLOYER':
            return 'Employer Console';
        default:
            return 'Dashboard';
    }
}

export function formatAlarmPositionLabel(position: string): string {
    const normalized = position.replaceAll(/\s*-\s*/g, ' - ').trim();
    if (normalized.length === 0) {
        return '-';
    }

    return normalized;
}
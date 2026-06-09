export const downloadCSV = (data: any[], filename: string) => {
  if (!data || !data.length) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Convert to CSV string
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];

          // Handle null/undefined
          if (value === null || value === undefined) return '';

          // Handle objects (convert to string or JSON)
          if (typeof value === 'object') {
            try {
              return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            } catch (e) {
              return '';
            }
          }

          // Handle strings with commas or quotes
          const stringValue = String(value);
          if (
            stringValue.includes(',') ||
            stringValue.includes('"') ||
            stringValue.includes('\n')
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }

          return stringValue;
        })
        .join(',')
    ),
  ].join('\n');

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

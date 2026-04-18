export function getLevenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[a.length][b.length];
}

export function findDuplicates(names: string[]): [string, string][] {
  const duplicates: [string, string][] = [];
  const processed = new Set<string>();

  for (let i = 0; i < names.length; i++) {
    if (processed.has(names[i])) continue;
    
    // Skip very short names to avoid false positives
    if (names[i].length < 4) continue;

    for (let j = i + 1; j < names.length; j++) {
      if (names[j].length < 4) continue;
      
      const distance = getLevenshteinDistance(
        names[i].toLowerCase().trim(), 
        names[j].toLowerCase().trim()
      );
      
      // If distance is exactly 1 or 2 (for longer names), they might be the same person.
      // E.g 'Ahmet Yılmaz' (12) vs 'Ahmet Ylmaz' (11) -> dist = 1
      const maxAllowedDist = Math.max(1, Math.floor(Math.min(names[i].length, names[j].length) / 5));

      if (distance > 0 && distance <= maxAllowedDist) {
        duplicates.push([names[i], names[j]]);
        processed.add(names[j]); // Skip further matching as it's already grouped
      }
    }
  }

  return duplicates;
}

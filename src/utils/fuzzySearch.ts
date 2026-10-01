import { Stock } from '../types/market';

/**
 * Calculates a fuzzy score for candidate string given search query.
 * Handles exact, prefix, substring, word-boundary, initials, and fuzzy character sequence matches.
 */
export function fuzzyMatchScore(query: string, text: string): number {
  if (!query || !text) return 0;

  const q = query.toLowerCase().trim();
  const t = text.toLowerCase().trim();

  if (!q || !t) return 0;

  // 1. Exact match
  if (q === t) return 100;

  // 2. Starts with query (Prefix match)
  if (t.startsWith(q)) return 85 + (q.length / t.length) * 10;

  // 3. Word start / boundary match (e.g. "Bank" matching "HDFC Bank", "Motors" matching "Tata Motors")
  const words = t.split(/[\s\-_&/.]+/);
  for (const w of words) {
    if (w === q) return 82;
    if (w.startsWith(q)) return 78;
  }

  // 4. Substring match
  if (t.includes(q)) return 65 + (q.length / t.length) * 10;

  // 5. Acronym / Initials match (e.g., "TCS" for "Tata Consultancy Services", "RIL" for "Reliance Industries")
  const initials = words.map(w => w[0]).join('');
  if (initials && (initials.startsWith(q) || initials.includes(q))) return 72;

  // 6. Subsequence match with gap penalty (allows typos / omitted chars e.g. "relance" -> "reliance")
  let qIdx = 0;
  let score = 0;
  let consecutive = 0;

  for (let i = 0; i < t.length && qIdx < q.length; i++) {
    if (t[i] === q[qIdx]) {
      qIdx++;
      consecutive++;
      score += 10 + consecutive * 5;
    } else {
      consecutive = 0;
    }
  }

  if (qIdx === q.length) {
    // All characters of query matched in sequence
    const matchRatio = q.length / t.length;
    return Math.min(58, Math.round(score * matchRatio));
  }

  // 7. Levenshtein edit distance for minor typos if query length >= 3
  if (q.length >= 3) {
    const distance = editDistance(q, t.slice(0, Math.min(t.length, q.length + 3)));
    if (distance <= 2) {
      return 45 - distance * 12;
    }
  }

  return 0;
}

function editDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
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
  return matrix[b.length][a.length];
}

/**
 * Searches a list of stocks using fuzzy matching algorithms.
 * Scores symbol, name, and sector to produce relevance-ranked results.
 */
export function searchStocksFuzzy(stocks: Stock[], query: string, maxResults: number = 10): Stock[] {
  const q = query.trim();
  if (!q) return [];

  const results: { stock: Stock; maxScore: number }[] = [];

  for (const stock of stocks) {
    const symbolScore = fuzzyMatchScore(q, stock.symbol) * 1.35; // Priority boost for stock ticker symbol
    const nameScore = fuzzyMatchScore(q, stock.name);
    const sectorScore = fuzzyMatchScore(q, stock.sector) * 0.7;

    const maxScore = Math.max(symbolScore, nameScore, sectorScore);

    if (maxScore > 18) {
      results.push({ stock, maxScore });
    }
  }

  results.sort((a, b) => b.maxScore - a.maxScore);

  return results.slice(0, maxResults).map(r => r.stock);
}

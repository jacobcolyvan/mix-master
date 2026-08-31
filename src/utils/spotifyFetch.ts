const SPOTIFY_PAGE_SIZE = 50;
const MAX_CONCURRENT_PAGE_REQUESTS = 8;

export const splitIntoChunks = <T>(items: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];

  for (let startIndex = 0; startIndex < items.length; startIndex += chunkSize) {
    chunks.push(items.slice(startIndex, startIndex + chunkSize));
  }

  return chunks;
};

export const mapWithConcurrency = async <T, R>(
  items: T[],
  maxConcurrent: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> => {
  const results: R[] = [];

  for (let startIndex = 0; startIndex < items.length; startIndex += maxConcurrent) {
    const concurrentItems = items.slice(startIndex, startIndex + maxConcurrent);
    const concurrentResults = await Promise.all(concurrentItems.map(mapper));
    results.push(...concurrentResults);
  }

  return results;
};

type PagedResponse<T> = {
  items: T[];
  total: number;
};

export const fetchOffsetPages = async <T>(
  fetchPage: (offset: number, limit: number) => Promise<PagedResponse<T>>
): Promise<T[]> => {
  const firstPage = await fetchPage(0, SPOTIFY_PAGE_SIZE);
  const total = firstPage.total ?? 0;

  const offsets: number[] = [];
  for (let offset = SPOTIFY_PAGE_SIZE; offset < total; offset += SPOTIFY_PAGE_SIZE) {
    offsets.push(offset);
  }

  const remainingPages = await mapWithConcurrency(offsets, MAX_CONCURRENT_PAGE_REQUESTS, (offset) =>
    fetchPage(offset, SPOTIFY_PAGE_SIZE)
  );

  return [firstPage, ...remainingPages].flatMap((page) => page.items);
};

const BASE_URL = "https://bont-fixture-app.onrender.com/api";

// How long cached data is considered "fresh" (5 minutes)
const CACHE_TTL_MS = 5 * 60 * 1000;

// ─── Internal cache store (in-memory, survives navigation within session) ──
const memCache = {};

const isFresh = (key) => {
  const entry = memCache[key];
  if (!entry) return false;
  return Date.now() - entry.ts < CACHE_TTL_MS;
};

const setMem = (key, data) => {
  memCache[key] = { data, ts: Date.now() };
};

const getMem = (key) => memCache[key]?.data ?? null;

// ─── Wake + prefetch ────────────────────────────────────────────
// Call this as early as possible (App.jsx mount).
// Fires fixtures + results in parallel so both are warm in memory
// before the user navigates anywhere.
export const warmAndPrefetch = () => {
  if (!navigator.onLine) return;
  // Fire and forget — populates memCache silently
  Promise.all([
    _fetchAndCache(`${BASE_URL}/fixtures`, "fixtures"),
    _fetchAndCache(`${BASE_URL}/results`,  "results"),
  ]).catch(() => {});
};

// Kept for backwards compat
export const warmServer = warmAndPrefetch;

// ─── Shared fetch helper ────────────────────────────────────────
const _fetchAndCache = async (url, key) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${key}`);
  const data = await res.json();
  setMem(key, data);
  return data;
};

// ─── Smart fetch: return memory cache instantly if fresh,
//     otherwise hit network (and update cache for next time) ─────
const smartFetch = async (url, key) => {
  if (isFresh(key)) {
    return getMem(key);
  }
  try {
    return await _fetchAndCache(url, key);
  } catch (err) {
    // Network failed — return stale cache rather than nothing
    const stale = getMem(key);
    if (stale) return stale;
    throw err;
  }
};

// Fetch fixtures AND results in a single parallel round-trip
export const getAllData = async () => {
  const [fixtures, results] = await Promise.all([
    getFixtures(),
    getResults(),
  ]);
  return { fixtures, results };
};

// ─── Invalidate cache after a write so next read is fresh ───────
const invalidate = (key) => { delete memCache[key]; };

// ----------------- SEASON RESET -----------------
// Deletes all fixtures and results from the backend.
// Called after a season has been successfully archived.
export const clearSeason = async () => {
  const [fixturesRes, resultsRes] = await Promise.all([
    fetch(`${BASE_URL}/fixtures`, { method: "DELETE" }),
    fetch(`${BASE_URL}/results`,  { method: "DELETE" }),
  ]);
  if (!fixturesRes.ok) throw new Error("Failed to clear fixtures");
  if (!resultsRes.ok)  throw new Error("Failed to clear results");
  // Invalidate all relevant caches
  invalidate("fixtures");
  invalidate("results");
};

// ----------------- FIXTURES -----------------
export const getFixtures = async () => {
  try {
    return await smartFetch(`${BASE_URL}/fixtures`, "fixtures");
  } catch (error) {
    console.error("getFixtures error:", error);
    return [];
  }
};

export const getFixtureById = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/fixtures/${id}`);
    if (!res.ok) throw new Error("Failed to fetch fixture");
    return await res.json();
  } catch (error) {
    console.error("getFixtureById error:", error);
    return null;
  }
};

export const addFixture = async (fixture) => {
  try {
    const res = await fetch(`${BASE_URL}/fixtures`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fixture),
    });
    if (!res.ok) throw new Error("Failed to add fixture");
    invalidate("fixtures");
    return await res.json();
  } catch (error) {
    console.error("addFixture error:", error);
    return null;
  }
};

export const updateFixture = async (id, fixture) => {
  try {
    const res = await fetch(`${BASE_URL}/fixtures/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fixture),
    });
    if (!res.ok) throw new Error("Failed to update fixture");
    invalidate("fixtures");
    return await res.json();
  } catch (error) {
    console.error("updateFixture error:", error);
    return null;
  }
};

export const deleteFixture = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/fixtures/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete fixture");
    invalidate("fixtures");
    return await res.json();
  } catch (error) {
    console.error("deleteFixture error:", error);
    return null;
  }
};

// ----------------- RESULTS -----------------
export const getResults = async () => {
  try {
    return await smartFetch(`${BASE_URL}/results`, "results");
  } catch (error) {
    console.error("getResults error:", error);
    return [];
  }
};

export const getResultById = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/results/${id}`);
    if (!res.ok) throw new Error("Failed to fetch result");
    return await res.json();
  } catch (error) {
    console.error("getResultById error:", error);
    return null;
  }
};

export const addResult = async (result) => {
  try {
    const res = await fetch(`${BASE_URL}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    });
    if (!res.ok) throw new Error("Failed to add result");
    invalidate("results");
    return await res.json();
  } catch (error) {
    console.error("addResult error:", error);
    return null;
  }
};

export const updateResult = async (id, result) => {
  try {
    const res = await fetch(`${BASE_URL}/results/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    });
    if (!res.ok) throw new Error("Failed to update result");
    invalidate("results");
    return await res.json();
  } catch (error) {
    console.error("updateResult error:", error);
    return null;
  }
};

export const deleteResult = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/results/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete result");
    invalidate("results");
    return await res.json();
  } catch (error) {
    console.error("deleteResult error:", error);
    return null;
  }
};

// ----------------- ARCHIVES -----------------
export const getArchives = async () => {
  try {
    return await smartFetch(`${BASE_URL}/archives`, "archives");
  } catch (error) {
    console.error("getArchives error:", error);
    return [];
  }
};

export const saveArchive = async (archive) => {
  try {
    const res = await fetch(`${BASE_URL}/archives`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(archive),
    });
    if (!res.ok) throw new Error("Failed to save archive");
    invalidate("archives");
    return await res.json();
  } catch (error) {
    console.error("saveArchive error:", error);
    return null;
  }
};

export const deleteArchive = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/archives/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete archive");
    invalidate("archives");
    return await res.json();
  } catch (error) {
    console.error("deleteArchive error:", error);
    return null;
  }
};

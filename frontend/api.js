const BASE_URL = "https://bont-fixture-app.onrender.com/api";

// Silently wake up the Render server as early as possible.
export const warmServer = () => {
  if (!navigator.onLine) return;
  fetch(`${BASE_URL}/fixtures`, { method: "HEAD" }).catch(() => {});
};

// Fetch fixtures AND results in one round-trip.
export const getAllData = async () => {
  const [fixtures, results] = await Promise.all([getFixtures(), getResults()]);
  return { fixtures, results };
};

// ----------------- FIXTURES -----------------
export const getFixtures = async () => {
  try {
    const res = await fetch(`${BASE_URL}/fixtures`);
    if (!res.ok) throw new Error("Failed to fetch fixtures");
    return await res.json();
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
    return await res.json();
  } catch (error) {
    console.error("deleteFixture error:", error);
    return null;
  }
};

// ----------------- RESULTS -----------------
export const getResults = async () => {
  try {
    const res = await fetch(`${BASE_URL}/results`);
    if (!res.ok) throw new Error("Failed to fetch results");
    return await res.json();
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
    return await res.json();
  } catch (error) {
    console.error("deleteResult error:", error);
    return null;
  }
};

// ----------------- ARCHIVES -----------------
export const getArchives = async () => {
  try {
    const res = await fetch(`${BASE_URL}/archives`);
    if (!res.ok) throw new Error("Failed to fetch archives");
    return await res.json();
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
    return await res.json();
  } catch (error) {
    console.error("deleteArchive error:", error);
    return null;
  }
};

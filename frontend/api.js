const BASE_URL = "http://localhost:5001/api";

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
    const res = await fetch(`${BASE_URL}/fixtures/${id}`, {
      method: "DELETE",
    });
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
    const res = await fetch(`${BASE_URL}/results/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete result");
    return await res.json();
  } catch (error) {
    console.error("deleteResult error:", error);
    return null;
  }
};

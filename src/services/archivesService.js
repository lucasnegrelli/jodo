import { configs } from './../config'
async function getArchives(filter) {
    try {
       const endpoint = `${configs.API_URL}/archives?${filter}`
       const res = await fetch(endpoint, { cache: "no-store", timeout: 5000 });
  
      if (!res.ok) {
        throw new Error(`🍄🦉🥑🥊🎱 Erro ao buscar dados: ${res.status} ${res.statusText}`);
      }
  
      const data = await res.json();
      return data.archives || [];
    } catch (error) {
      console.error("Erro ao buscar artigos:", error.message);
      return [];
    }
  }

  async function getUniqueArchive(id) {
    try {
      const res = await fetch(`${configs.API_URL}/archive/${id}`, { cache: "no-store", timeout: 5000 });
  
      if (!res.ok) {
        throw new Error(`🍄🦉🥑🥊🎱 Erro ao buscar dados: ${res.status} ${res.statusText}`);
      }
  
      const data = await res.json();
      return data.data[0] || [];
    } catch (error) {
      console.error("Erro ao buscar artigos:", error.message);
      return [];
    }
  }
  module.exports = {
    getArchives,
    getUniqueArchive
  }
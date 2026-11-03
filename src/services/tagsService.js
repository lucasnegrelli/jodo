import { configs } from './../config'
async function getTags() {
    try {
      const res = await fetch(`${configs.API_URL}/tags`, { cache: "no-store", timeout: 5000 });
      if (!res.ok) {
        throw new Error(`🍄🦉🥑🥊🎱 Erro ao buscar dados: ${res.status} ${res.statusText}`);
      }
  
      const data = await res.json();
      return data || [];
    } catch (error) {
      console.error("Erro ao buscar artigos:", error.message);
      return [];
    }
  }

  module.exports = {
    getTags
  }
import { configs } from './../config'
async function getEvents() {
    try {
      const res = await fetch(`${configs.API_URL}/events`, { cache: "no-store", timeout: 5000 });
  
      if (!res.ok) {
        throw new Error(`🍄🦉🥑🥊🎱 Erro ao buscar dados: ${res.status} ${res.statusText}`);
      }
  
      const data = await res.json();
      return data.events || [];
    } catch (error) {
      console.error("Erro ao buscar artigos:", error.message);
      return [];
    }
  }


  module.exports = {
    getEvents,
  }
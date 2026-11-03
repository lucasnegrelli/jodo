import { configs } from './../config'
async function getArticles(filter) {
    try {
      const endpoint = `${configs.API_URL}/article?${filter}`
      const res = await fetch(endpoint, { cache: "no-store", timeout: 5000 });
  
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

  async function getUniqueArticle(id) {
    try {
      const res = await fetch(`${configs.API_URL}/article/${id}`, { cache: "no-store", timeout: 5000 });
      console.log(`${configs.API_URL}/article/${id}`, '🍄🦉🥑🥊🎱')
      if (!res.ok) {
        throw new Error(`🍄🦉🥑🥊🎱 Erro ao buscar dados: ${res.status} ${res.statusText}`);
      }
  
      const data = await res.json();
      return data[0] || [];
    } catch (error) {
      console.error("Erro ao buscar artigos:", error.message);
      return [];
    }
  }


  module.exports = {
    getArticles,
    getUniqueArticle
  }
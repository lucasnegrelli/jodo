// Fonte única de dados: ver ./mapa.js
import { getTodos, getArtista as _get, manifesto } from "./mapa";

export { manifesto };
export function getArtistas() {
  return getTodos();
}
export function getArtista(slug) {
  return _get(slug);
}
export default getTodos();

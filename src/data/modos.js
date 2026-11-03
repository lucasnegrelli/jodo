/*
  MODOS: quais abas do mundo estão abertas ao público. Se só sobrar Artistas, o menu inteiro some e fica só o botão "filtrar".
  Eventos está aberto por enquanto (os do site antigo são de 2025 e só mostram "já rolou"). Para fechar ao público:
  trocar para false; o código e os dados (eventos.js) continuam prontos.
*/
export const MODOS = {
  artistas: true,
  eventos: false, // ainda sem eventos novos: menu escondido (2026-10-22); voltar para true quando houver
  acervo: false, // o acervo agora vive dentro dos artistas (filtro "todos")
  textos: false, // ainda sem textos publicados; idem
};

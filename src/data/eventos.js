/*
  EVENTOS: onde está rolando (e onde já rolou) no mundo da JODO.
  Fonte: site antigo (jodo.com.br, lista de eventos) + cartazes copiados para public/eventos.
  - lugar: coordenadas aproximadas do endereço (aproximado: true => conferir antes de publicar).
  - quando: ISO (AAAA-MM-DD). O mapa separa "rolando/vem aí" de "já rolou" pela data de hoje.
  Futuro: este arquivo vira o cadastro das casas de show e das notificações (contratação segura).
*/

export const EVENTOS = [
  {
    id: 'cafundo-2025',
    titulo: 'JODO no Cafundó',
    sub: 'c/ 1LUM3, PHINEA$, 82 e Margarida The Cat',
    quando: '2025-05-30',
    cidade: 'São Paulo',
    local: 'Cafundó',
    endereco: 'Rua Teodoro Sampaio, 2785, São Paulo',
    lat: -23.5622, lon: -46.6875, aproximado: true,
    cartaz: '/eventos/cafundo.webp',
    link: 'https://www.sympla.com.br/evento/jodo-no-cafundo-apresenta-1lum3-phinea-82-margarida-the-cat-e-bomba-volume/2945825',
    linkRotulo: 'Sympla',
    cor: '#7fcf6a',
  },
  {
    id: 'antares-2025',
    titulo: 'PHINEA$ apresenta Antares',
    sub: 'no Cadoz Underground Beer',
    quando: '2025-04-19',
    cidade: 'São Paulo',
    local: 'Cadoz Underground Beer',
    endereco: 'Praça Dona Mariquinha Sciascia, 37, Subsolo, Tremembé, São Paulo',
    lat: -23.4608, lon: -46.6085, aproximado: true,
    cartaz: '/eventos/antares.webp',
    cor: '#c04a96',
  },
  {
    id: 'haxan-matilha-2025',
    titulo: 'Feira Perspectiva, lançamento do EP Häxan',
    sub: 'com Zulu Luiza',
    quando: '2025-03-22',
    cidade: 'São Paulo',
    local: 'Matilha Cultural',
    endereco: 'R. Rego Freitas, 542, República, São Paulo',
    lat: -23.5455, lon: -46.6500, aproximado: true,
    cartaz: '/eventos/haxan-matilha.webp',
    link: 'https://www.instagram.com/reel/DG8TfcAxlOk/',
    linkRotulo: 'Instagram',
    cor: '#d7692c',
  },
  {
    id: 'feira-ideias-2025',
    titulo: 'Feira das Ideias',
    sub: 'Live painting com Zulu Luiza',
    quando: '2025-03-16',
    cidade: 'São Paulo',
    local: 'MIS, Museu da Imagem e do Som',
    endereco: 'Av. Europa, 158, Jardim Europa, São Paulo',
    lat: -23.5762, lon: -46.6838, aproximado: true,
    cartaz: '/eventos/feira-ideias.webp',
    link: 'https://www.instagram.com/p/DG372uzvzX3/',
    linkRotulo: 'Instagram',
    cor: '#e0b43a',
  },
  {
    id: 'rock-delas-2025',
    titulo: 'Festival Rock Delas',
    sub: 'da Fábrica de Cultura Curuçá',
    quando: '2025-03-08',
    cidade: 'São Paulo',
    local: 'Jardim Robru',
    endereco: 'R. Pedra Dourada, 65, Jardim Robru, São Paulo',
    lat: -23.4935, lon: -46.4180, aproximado: true,
    cartaz: '/eventos/rock-delas.webp',
    link: 'https://www.instagram.com/p/DGl4mqzPzbI/',
    linkRotulo: 'Instagram',
    cor: '#5aa6e0',
  },
];

// novidades que rodeiam o globo (lançamentos, avisos). Só entra o que está confirmado.
export const NOVIDADES = [
  { id: 'n-margarida', tipo: 'Lançamento', titulo: 'Margarida The Cat, (Reality in a) Speeding Cloud', quando: '2026-09-29', href: '/artistas/margarida-the-cat', cor: '#c04a96' },
  { id: 'n-haxan', tipo: 'Disco', titulo: 'Häxan, EP do 82', quando: '2025-03-22', href: '/artistas/82', cor: '#d7692c' },
];

export function ehPassado(iso, hoje = new Date()) {
  const d = new Date(iso + 'T23:59:59');
  return d < hoje;
}

export function dataBR(iso) {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

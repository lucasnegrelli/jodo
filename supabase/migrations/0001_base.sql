-- JODO · base v0: perfis (fã/artista/casa), artistas e seguidores.
-- Como rodar: Supabase > SQL Editor > New query > cole tudo > Run. É seguro rodar uma vez só.
-- O slug de artistas.slug é o mesmo id usado em src/data/mapa.js (ex.: 'lessa-gustavo').

-- perfis: um por usuário do Supabase Auth, criado sozinho no cadastro
create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  papel text not null default 'fa' check (papel in ('fa', 'artista', 'casa', 'admin')),
  nome text,
  avatar_url text,
  criado_em timestamptz not null default now()
);

create table public.artistas (
  slug text primary key,
  nome text not null,
  dono uuid references public.perfis (id) on delete set null, -- quem administra a página (depois de reivindicar)
  criado_em timestamptz not null default now()
);

create table public.seguidores (
  fa uuid not null references public.perfis (id) on delete cascade,
  artista text not null references public.artistas (slug) on delete cascade,
  desde timestamptz not null default now(),
  primary key (fa, artista)
);
create index seguidores_por_artista on public.seguidores (artista);

-- cria o perfil quando alguém se cadastra
create or replace function public.novo_usuario() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfis (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
  return new;
end $$;
create trigger ao_criar_usuario after insert on auth.users
  for each row execute function public.novo_usuario();

-- segurança por linha (RLS): cada um mexe só no que é seu
alter table public.perfis enable row level security;
alter table public.artistas enable row level security;
alter table public.seguidores enable row level security;

create policy "ver o próprio perfil" on public.perfis for select to authenticated using (id = (select auth.uid()));
create policy "editar o próprio perfil" on public.perfis for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
-- o usuário só pode mudar nome e avatar; o papel (fa/artista/casa/admin) só muda por quem administra o banco
revoke update on public.perfis from authenticated;
grant update (nome, avatar_url) on public.perfis to authenticated;

create policy "qualquer um vê os artistas" on public.artistas for select to anon, authenticated using (true);

create policy "ver quem eu sigo" on public.seguidores for select to authenticated using (fa = (select auth.uid()));
create policy "seguir" on public.seguidores for insert to authenticated with check (fa = (select auth.uid()));
create policy "deixar de seguir" on public.seguidores for delete to authenticated using (fa = (select auth.uid()));

-- contagem pública de seguidores (sem expor quem segue)
create view public.artistas_com_seguidores as
  select a.slug, a.nome, count(s.fa)::int as seguidores
  from public.artistas a left join public.seguidores s on s.artista = a.slug
  group by a.slug, a.nome;
grant select on public.artistas_com_seguidores to anon, authenticated;

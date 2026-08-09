-- CoachDeck – schemat bazy (Supabase / PostgreSQL)
-- Uruchom w panelu Supabase: SQL Editor → wklej → Run
-- lub przez CLI: supabase db push

create table if not exists teams (
  id text primary key,
  name text not null,
  sport text not null,
  category text not null,
  season text not null,
  color_accent text
);

create table if not exists players (
  id text primary key,
  team_id text references teams(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  number int,
  position text,
  birth_year int,
  fitness int default 60,
  technique int default 60,
  tactics int default 60,
  mentality int default 60,
  status text not null default 'available'
);

create table if not exists payments (
  id text primary key,
  player_id text references players(id) on delete cascade,
  team_id text references teams(id) on delete cascade,
  kind text not null default 'dues',
  title text not null,
  amount numeric(10,2) not null,
  due_date timestamptz not null,
  paid_date timestamptz,
  status text not null default 'pending'
);

-- Mapowanie transakcji Przelewy24 (dostęp tylko dla service_role / funkcji brzegowych).
create table if not exists p24_transactions (
  id bigint generated always as identity primary key,
  payment_id text references payments(id) on delete cascade,
  session_id text unique not null,
  token text,
  order_id bigint,
  amount int not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- ---------- Row Level Security ----------
alter table teams enable row level security;
alter table players enable row level security;
alter table payments enable row level security;
alter table p24_transactions enable row level security;

-- Na start (MVP/demo): odczyt publiczny + zapis płatności z aplikacji.
-- W produkcji z logowaniem zamień 'anon'/'true' na reguły oparte o auth.uid().
drop policy if exists "read teams" on teams;
create policy "read teams" on teams for select using (true);

drop policy if exists "read players" on players;
create policy "read players" on players for select using (true);

drop policy if exists "read payments" on payments;
create policy "read payments" on payments for select using (true);

drop policy if exists "write payments" on payments;
create policy "write payments" on payments for all using (true) with check (true);

-- p24_transactions: brak polityk dla anon => dostęp wyłącznie przez service_role
-- (funkcje brzegowe p24-register / p24-webhook). To celowe.

-- ---------- Dane startowe (opcjonalne – takie same jak w trybie demo) ----------
insert into teams (id, name, sport, category, season, color_accent) values
  ('t1','Orły Warszawa','football','Seniorzy','2025/2026','#059669'),
  ('t2','Orlęta U-15','football','U-15','2025/2026','#10B981'),
  ('t3','Wisła Basket','basketball','Juniorzy','2025/2026','#EA580C')
on conflict (id) do nothing;

insert into players (id, team_id, first_name, last_name, number, position, birth_year, fitness, technique, tactics, mentality, status) values
  ('p1','t1','Marek','Kowalski',1,'Bramkarz',1998,78,72,80,85,'available'),
  ('p2','t1','Jan','Nowak',4,'Obrońca',1996,82,70,78,76,'available'),
  ('p3','t1','Piotr','Wiśniewski',8,'Pomocnik',1999,88,84,82,80,'available'),
  ('p4','t1','Tomasz','Lewandowski',9,'Napastnik',2000,90,89,76,88,'available'),
  ('p5','t1','Adam','Zieliński',11,'Napastnik',2001,85,80,72,75,'injured'),
  ('p6','t2','Kacper','Wójcik',7,'Pomocnik',2010,70,68,60,72,'available'),
  ('p7','t2','Igor','Kamiński',10,'Napastnik',2010,74,75,58,70,'available'),
  ('p8','t3','Bartosz','Mazur',23,'Rozgrywający',2005,80,82,78,79,'available'),
  ('p9','t3','Filip','Krawczyk',12,'Środkowy',2004,84,76,74,77,'suspended')
on conflict (id) do nothing;

insert into payments (id, player_id, team_id, kind, title, amount, due_date, status) values
  ('pay2','p2','t1','dues','Składka miesięczna',120, now() + interval '3 days','pending'),
  ('pay3','p3','t1','dues','Składka miesięczna',120, now() - interval '8 days','overdue'),
  ('pay4','p4','t1','camp','Obóz letni – zaliczka',400, now() + interval '10 days','pending'),
  ('pay5','p6','t2','dues','Składka miesięczna',90, now() - interval '3 days','overdue'),
  ('pay7','p8','t3','dues','Składka miesięczna',150, now() + interval '5 days','pending'),
  ('pay8','p9','t3','equipment','Komplet strojów',220, now() - interval '2 days','overdue')
on conflict (id) do nothing;

-- Up Migration

alter table if exists freights add column if not exists origin text;
alter table if exists freights add column if not exists destination text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'freights'
      and column_name = 'route'
  ) then
    update freights
    set origin = split_part(route, ' x ', 1)
    where (origin is null or origin = '')
      and route like '% x %';

    update freights
    set destination = split_part(route, ' x ', 2)
    where (destination is null or destination = '')
      and route like '% x %';

    update freights
    set origin = route
    where (origin is null or origin = '')
      and route is not null
      and route <> ''
      and route not like '% x %';
  end if;
end $$;

update freights set origin = coalesce(origin, '') where origin is null;
update freights set destination = coalesce(destination, '') where destination is null;

alter table if exists freights alter column origin set not null;
alter table if exists freights alter column destination set not null;

alter table if exists cargas add column if not exists freight_origin text;
alter table if exists cargas add column if not exists freight_destination text;

update cargas c
set freight_origin = f.origin,
    freight_destination = f.destination
from freights f
where c.freight_id = f.id
  and (
    c.freight_origin is null
    or c.freight_origin = ''
    or c.freight_destination is null
    or c.freight_destination = ''
  );

update cargas set freight_origin = coalesce(freight_origin, '') where freight_origin is null;
update cargas set freight_destination = coalesce(freight_destination, '') where freight_destination is null;

alter table if exists cargas alter column freight_origin set not null;
alter table if exists cargas alter column freight_destination set not null;

alter table if exists freights drop column if exists route;

-- Down Migration

alter table if exists freights add column if not exists route text;

alter table if exists cargas alter column freight_destination drop not null;
alter table if exists cargas alter column freight_origin drop not null;
alter table if exists freights alter column destination drop not null;
alter table if exists freights alter column origin drop not null;

update freights
set route = trim(both ' ' from concat_ws(' x ', nullif(origin, ''), nullif(destination, '')))
where route is null;

alter table if exists freights drop column if exists destination;
alter table if exists freights drop column if exists origin;
alter table if exists cargas drop column if exists freight_destination;
alter table if exists cargas drop column if exists freight_origin;

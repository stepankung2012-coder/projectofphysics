create or replace function public.join_class(class_code text)
returns table (
  class_id uuid,
  class_name text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_class public.classes;
  user_profile_role text;
begin
  select profiles.role
  into user_profile_role
  from public.profiles
  where profiles.id = auth.uid();

  if user_profile_role is distinct from 'student' then
    raise exception 'Только ученик может подключиться к классу';
  end if;

  select classes.*
  into target_class
  from public.classes
  where classes.invite_code = upper(trim(class_code));

  if target_class.id is null then
    raise exception 'Класс с таким кодом не найден';
  end if;

  insert into public.class_members (class_id, student_id)
  values (target_class.id, auth.uid())
  on conflict do nothing;

  return query
  select target_class.id, target_class.name;
end;
$$;

grant execute on function public.join_class(text) to authenticated;

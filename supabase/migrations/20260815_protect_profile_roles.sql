-- Users may update their own name, but only a database administrator may
-- promote an account from student to teacher.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and new.role is distinct from old.role then
    raise exception 'Only an administrator can change a user role';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_role_changes on public.profiles;

create trigger protect_profile_role_changes
before update on public.profiles
for each row execute function public.protect_profile_role();

-- Private storage for project materials. Run this migration in Supabase SQL Editor.
insert into storage.buckets (id, name, public, file_size_limit)
values ('project-files', 'project-files', false, 10485760)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

drop policy if exists "Project files read" on storage.objects;
create policy "Project files read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'project-files'
  and exists (
    select 1
    from public.projects
    where projects.id::text = (storage.foldername(name))[1]
      and public.can_access_project(projects.id)
  )
);

drop policy if exists "Students upload project files" on storage.objects;
create policy "Students upload project files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'project-files'
  and exists (
    select 1
    from public.projects
    where projects.id::text = (storage.foldername(name))[1]
      and projects.student_id = auth.uid()
  )
);

drop policy if exists "Students delete project files" on storage.objects;
create policy "Students delete project files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'project-files'
  and exists (
    select 1
    from public.projects
    where projects.id::text = (storage.foldername(name))[1]
      and projects.student_id = auth.uid()
  )
);

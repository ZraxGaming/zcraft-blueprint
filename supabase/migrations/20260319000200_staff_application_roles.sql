ALTER TABLE public.staff_applications
ADD COLUMN IF NOT EXISTS target_role text;

UPDATE public.staff_applications
SET target_role = 'moderator'
WHERE target_role IS NULL OR btrim(target_role) = '';

ALTER TABLE public.staff_applications
ALTER COLUMN target_role SET NOT NULL;

ALTER TABLE public.staff_applications
DROP CONSTRAINT IF EXISTS staff_applications_user_id_key;

ALTER TABLE public.staff_applications
DROP CONSTRAINT IF EXISTS staff_applications_user_id_target_role_key;

ALTER TABLE public.staff_applications
ADD CONSTRAINT staff_applications_user_id_target_role_key UNIQUE (user_id, target_role);

INSERT INTO public.admin_settings (key, value)
VALUES (
  'staff_application_roles',
  '[{"id":"helper","label":"Helper","description":"Entry-level support for chat, tickets, and everyday player issues.","enabled":false,"form":[{"id":"timezone","label":"Timezone","type":"text","required":true,"placeholder":"UTC+4"},{"id":"experience","label":"Moderation or community experience","type":"textarea","required":true,"placeholder":"Describe your previous experience."},{"id":"why_join","label":"Why do you want to join the staff team?","type":"textarea","required":true,"placeholder":"Tell us why you would be a good fit."}]},{"id":"moderator","label":"Moderator","description":"Moderate the server, handle reports, and keep the community healthy.","enabled":false,"form":[{"id":"timezone","label":"Timezone","type":"text","required":true,"placeholder":"UTC+4"},{"id":"experience","label":"Moderation or community experience","type":"textarea","required":true,"placeholder":"Describe your previous experience."},{"id":"why_join","label":"Why do you want to join the staff team?","type":"textarea","required":true,"placeholder":"Tell us why you would be a good fit."}]},{"id":"builder","label":"Builder","description":"Help create maps, server visuals, and polished event spaces.","enabled":false,"form":[{"id":"timezone","label":"Timezone","type":"text","required":true,"placeholder":"UTC+4"},{"id":"portfolio","label":"Build portfolio or screenshots","type":"textarea","required":true,"placeholder":"Share links or describe your best builds."},{"id":"style","label":"What build styles are you strongest at?","type":"textarea","required":true,"placeholder":"Medieval, fantasy, modern, terrain, etc."}]}]'
)
ON CONFLICT (key) DO NOTHING;

-- Run after the backend has initialized the public.issues and
-- public.processing_jobs tables. The Edge Function uses this RPC to apply AI
-- results atomically.
create or replace function public.process_issue_ai_results(
  p_job_id uuid,
  p_ai_result jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_issue_id uuid;
begin
  select issue_id
    into target_issue_id
    from public.processing_jobs
   where id = p_job_id
     and status in ('pending', 'processing', 'failed')
   for update;

  if target_issue_id is null then
    raise exception 'Processing job not found or is not processable';
  end if;

  update public.processing_jobs
     set status = 'completed',
         result = p_ai_result,
         error = null,
         "updatedAt" = now()
   where id = p_job_id;

  update public.issues
     set category = coalesce(p_ai_result->>'finalCategory', category),
         priority_score = coalesce((p_ai_result->>'fusionScore')::double precision, priority_score),
         ai_image_top3 = coalesce(p_ai_result->'imageTop3', ai_image_top3),
         ai_audio_top3 = coalesce(p_ai_result->'audioTop3', ai_audio_top3),
         ai_text_top3 = coalesce(p_ai_result->'textTop3', ai_text_top3),
         audio_text = coalesce(p_ai_result->>'audioText', audio_text),
         fusion_final_category = coalesce(p_ai_result->>'finalCategory', fusion_final_category),
         fusion_confidence_score = coalesce((p_ai_result->>'fusionScore')::double precision, fusion_confidence_score),
         needs_human_review = coalesce((p_ai_result->>'needsHumanReview')::boolean, needs_human_review),
         status = case
           when coalesce((p_ai_result->>'needsHumanReview')::boolean, false) then 'Pending Review'
           else status
         end,
         "updatedAt" = now()
   where id = target_issue_id;

  return jsonb_build_object('job_id', p_job_id, 'issue_id', target_issue_id, 'status', 'completed');
end;
$$;

revoke all on function public.process_issue_ai_results(uuid, jsonb) from public;
grant execute on function public.process_issue_ai_results(uuid, jsonb) to service_role;

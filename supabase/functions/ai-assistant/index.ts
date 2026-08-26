import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) return json({ error: "Требуется авторизация" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!supabaseUrl || !supabaseAnonKey || !openAiKey) {
      return json({ error: "Серверная функция не настроена" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return json({ error: "Сессия недействительна" }, 401);

    const { projectId, stageIndex, stageTitle, stageGoal, projectTitle, prompt, recentMessages } = await request.json();
    if (!projectId || !Number.isInteger(stageIndex) || typeof prompt !== "string" || !prompt.trim()) {
      return json({ error: "Некорректный запрос" }, 400);
    }
    if (prompt.length > 4000) return json({ error: "Запрос слишком длинный" }, 400);

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, student_id, title")
      .eq("id", projectId)
      .single();
    if (projectError || !project || project.student_id !== userData.user.id) {
      return json({ error: "ИИ-помощник доступен только ученику его проекта" }, 403);
    }

    const context = Array.isArray(recentMessages)
      ? recentMessages.slice(-6).map((message) => `${message.role === "ai" ? "Ассистент" : "Ученик"}: ${String(message.text).slice(0, 1500)}`).join("\n")
      : "";
    const input = [
      `Проект: ${projectTitle || project.title}`,
      `Этап: ${stageTitle || `Этап ${stageIndex + 1}`}`,
      stageGoal ? `Цель этапа: ${stageGoal}` : "",
      context ? `Недавний диалог:\n${context}` : "",
      `Новый запрос ученика: ${prompt.trim()}`,
    ].filter(Boolean).join("\n\n");

    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: Deno.env.get("OPENAI_MODEL") || "gpt-5.4-mini",
        store: false,
        max_output_tokens: 700,
        instructions: "Ты доброжелательный ИИ-помощник школьного проекта по физике. Отвечай по-русски, ясно и по возрасту. Помогай уточнять мысли, задавай вопросы и объясняй физику, но не выполняй проект целиком вместо ученика. Отмечай, что необходимо проверить экспериментально или по надёжным источникам. Не придумывай источники и факты.",
        input,
      }),
    });
    const responseBody = await openAiResponse.json();
    if (!openAiResponse.ok) {
      console.error("OpenAI error", responseBody?.error?.code || openAiResponse.status);
      return json({ error: "ИИ временно недоступен. Попробуйте позже." }, 502);
    }

    const answer = (responseBody.output || [])
      .flatMap((item: { content?: Array<{ type?: string; text?: string }> }) => item.content || [])
      .filter((part: { type?: string }) => part.type === "output_text")
      .map((part: { text?: string }) => part.text || "")
      .join("\n")
      .trim();
    if (!answer) return json({ error: "ИИ не вернул текстовый ответ" }, 502);

    const userMessage = { id: crypto.randomUUID(), role: "user", text: prompt.trim(), createdAt: new Date().toISOString() };
    const aiMessage = { id: crypto.randomUUID(), role: "ai", text: answer, createdAt: new Date().toISOString() };
    const { data: stageRow } = await supabase
      .from("project_stages")
      .select("ai_chat, status")
      .eq("project_id", projectId)
      .eq("stage_index", stageIndex)
      .maybeSingle();
    const updatedChat = [...(Array.isArray(stageRow?.ai_chat) ? stageRow.ai_chat : []), userMessage, aiMessage];

    const { error: stageError } = await supabase.from("project_stages").upsert({
      project_id: projectId,
      stage_index: stageIndex,
      status: stageRow?.status || "Черновик",
      ai_chat: updatedChat,
      updated_at: new Date().toISOString(),
    }, { onConflict: "project_id,stage_index" });
    if (stageError) return json({ error: `Не удалось сохранить диалог: ${stageError.message}` }, 500);

    await supabase.from("stage_history").insert({
      project_id: projectId,
      stage_index: stageIndex,
      actor_id: userData.user.id,
      actor_role: "student",
      event_type: "ai_interaction",
      prompt: prompt.trim(),
      ai_response: answer,
    });

    return json({ userMessage, aiMessage });
  } catch (error) {
    console.error(error);
    return json({ error: "Внутренняя ошибка серверной функции" }, 500);
  }
});

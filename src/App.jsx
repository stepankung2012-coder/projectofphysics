import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import AuthScreen from "./AuthScreen";
import { supabase } from "./supabaseClient";
import {
  ArrowLeft,
  Archive,
  ArchiveRestore,
  Bot,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FilePlus2,
  GraduationCap,
  Lightbulb,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Plus,
  RefreshCcw,
  Send,
  Sparkles,
  Trash2,
  UploadCloud,
  Users,
  UserRound,
} from "lucide-react";

const stages = [
  {
    title: "Выбор темы и формулирование проблемы",
    description: "При формулировке темы проекта - ученик выписывает всё, что его интересет - хобби, увлечения, книги, музыка. После этого транслирует это ИИ и просит сформулировать разные варианты тем для проектной деятельности по физике с учетом перечисленных интересов. Данные темы могут быть связаны между собой либо нет. После выбора темы проектной работы ученик сам ищет проблему, которую можно было бы рассмотреть в данной работе",
    goal: "Понять, какую проблему нужно исследовать и почему она значима.",
    tasks: {
      teacher: "Помогает сузить тему, задает уточняющие вопросы, проверяет реалистичность проблемы.",
      ai: "Предлагает варианты формулировок, помогает найти связи с физическими законами.",
      student: "Описывает проблему своими словами и объясняет личный интерес к теме.",
    },
  },
  {
    title: "Постановка цели и выдвижение гипотезы",
    description: "Ученик формулирует цель и гипотезу самостоятельно - вписывает ее в отдельную графу на сайте. После чего вбивает эту формулировку в ИИ с промтом \"скорректируй цель и гипотезу или предложи новую с учетом выбранной темы работы \". После чего учитель помогает выбрать окончательный вариант.",
    goal: "Сформулировать измеримую цель и проверяемую гипотезу.",
    tasks: {
      teacher: "Проверяет корректность цели и помогает связать гипотезу с учебным материалом.",
      ai: "Переформулирует черновики, предлагает критерии проверяемости.",
      student: "Записывает финальную цель, гипотезу и объясняет, как их можно проверить.",
    },
  },
  {
    title: "Планирование исследования",
    description: "Ученик выстраивает план проведения  экспериментальной части работы. В процессе обсуждает это с ИИ. После чего учитель проверяет итоговый план по критериям безопасности, целесообразности и доступности эксперимента",
    goal: "Получить ясный маршрут выполнения проекта.",
    tasks: {
      teacher: "Согласует этапы работы, предупреждает о рисках и ограничениях.",
      ai: "Помогает разбить работу на шаги и подобрать безопасные способы проверки.",
      student: "Составляет план, распределяет время и фиксирует необходимые материалы.",
    },
  },
  {
    title: "Поиск и анализ информации",
    description: "Ученик пишет промт в ИИ: напиши 10 реально существующих источников информации по моей теме работы, чтобы я будучи учеником \"...\" класса смог разобраться в изучаемом вопросе. Учитель рекомендует дополняет рекомендации другой литературой.",
    goal: "Собрать надежную теоретическую основу проекта.",
    tasks: {
      teacher: "Рекомендует источники и учит отличать научную информацию от неподтвержденной.",
      ai: "Объясняет сложные термины и помогает составить список вопросов к источникам.",
      student: "Конспектирует найденное, сравнивает источники и делает первичные выводы.",
    },
  },
  {
    title: "Проведение эксперимента",
    description: "Выполняются измерения, наблюдения, моделирование или практическая проверка.",
    goal: "Получить данные, необходимые для подтверждения или опровержения гипотезы.",
    tasks: {
      teacher: "Следит за безопасностью, корректностью методики и качеством измерений.",
      ai: "не участвует на данном этапе",
      student: "Проводит эксперимент, записывает данные и прикладывает материалы.",
    },
  },
  {
    title: "Обработка результатов",
    description: "Данные переводятся в таблицы, графики, расчеты и интерпретации.",
    goal: "Понять, что показывают полученные результаты.",
    tasks: {
      teacher: "Проверяет расчеты, графики и корректность вывода по данным.",
      ai: "Помогает найти ошибки в расчетах и подобрать способ визуализации.",
      student: "Обрабатывает данные, объясняет погрешности и формулирует промежуточные выводы.",
    },
  },
  {
    title: "Подготовка продукта",
    description: "Создается итоговый материал: доклад, презентация, модель, стенд или демонстрация.",
    goal: "Оформить результат проекта в понятной и убедительной форме.",
    tasks: {
      teacher: "Дает обратную связь по структуре, научности и ясности итогового продукта.",
      ai: "Помогает улучшить текст, структуру выступления и визуальные материалы.",
      student: "Создает итоговый продукт и фиксирует, какие решения принял самостоятельно.",
    },
  },
  {
    title: "Защита и рефлексия",
    description: "Ученик представляет проект, получает вопросы и анализирует собственный путь.",
    goal: "Показать результат, осмыслить опыт и вклад каждого участника.",
    tasks: {
      teacher: "Оценивает защиту, задает вопросы и фиксирует рекомендации.",
      ai: "Помогает подготовиться к вопросам и оформить рефлексию.",
      student: "Защищает проект, отвечает на вопросы и записывает финальные выводы.",
    },
  },
];

const defaultProjects = [
  {
    id: "project-1",
    title: "Энергия маятника",
    subject: "Механика",
    owner: "Анна Морозова",
    updatedAt: "08.08.2026",
  },
  {
    id: "project-2",
    title: "Теплопроводность материалов",
    subject: "Термодинамика",
    owner: "Илья Орлов",
    updatedAt: "07.08.2026",
  },
  {
    id: "project-3",
    title: "Оптика водной линзы",
    subject: "Оптика",
    owner: "Мария Белова",
    updatedAt: "06.08.2026",
  },
];

const fields = [
  "Что сделал ученик самостоятельно?",
  "Чем помог ИИ?",
  "Какие запросы были отправлены ИИ?",
  "Ответ ИИ",
  "Что оказалось неверным?",
  "Что пришлось изменить?",
  "Какие выводы сделал ученик?",
];

const STORAGE_KEY = "physics-project-journal-v1";

const createStageState = (stageIndex) => ({
  status: stageIndex === 0 ? "Черновик" : "Не начат",
  grade: "",
  teacherComment: "",
  files: [],
  aiChat: [],
  diary: Object.fromEntries(fields.map((field) => [field, ""])),
  responseGrades: Object.fromEntries(fields.map((field) => [field, ""])),
});

const createInitialData = () => ({
  studentProjectId: defaultProjects[0]?.id,
  projects: defaultProjects.map((project) => ({
    ...project,
    archived: false,
    stages: stages.map((_, index) => createStageState(index)),
  })),
});

const normalizeStage = (stage, index) => {
  const base = createStageState(index);
  return {
    ...base,
    ...stage,
    files: Array.isArray(stage?.files) ? stage.files : base.files,
    aiChat: Array.isArray(stage?.aiChat) ? stage.aiChat : base.aiChat,
    diary: {
      ...base.diary,
      ...(stage?.diary || {}),
    },
    responseGrades: {
      ...base.responseGrades,
      ...(stage?.responseGrades || {}),
    },
  };
};

const normalizeProject = (project, index) => {
  const fallback = defaultProjects[index % defaultProjects.length] || defaultProjects[0];
  return {
    ...fallback,
    ...project,
    id: project?.id || `project-${index + 1}`,
    archived: Boolean(project?.archived),
    stages: stages.map((_, stageIndex) => normalizeStage(project?.stages?.[stageIndex], stageIndex)),
  };
};

const normalizeData = (rawData) => {
  if (!Array.isArray(rawData?.projects)) return createInitialData();
  const projects = rawData.projects.map(normalizeProject);
  const savedStudentProjectExists = projects.some(
    (project) => project.id === rawData.studentProjectId,
  );
  return {
    ...rawData,
    studentProjectId:
      rawData.studentProjectId === null
        ? null
        : savedStudentProjectExists
          ? rawData.studentProjectId
          : projects[0]?.id,
    projects,
  };
};

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return createInitialData();
    return normalizeData(JSON.parse(saved));
  } catch {
    return createInitialData();
  }
}

const stageToDatabaseRow = (projectId, stage, index, role) => {
  const sharedFields = {
    project_id: projectId,
    stage_index: index,
    status: stage.status,
    updated_at: new Date().toISOString(),
  };

  if (role === "teacher") {
    return {
      ...sharedFields,
      teacher_comment: stage.teacherComment,
      grade: stage.grade ? Number(stage.grade) : null,
      response_grades: stage.responseGrades,
    };
  }

  return {
    ...sharedFields,
    diary: stage.diary,
    ai_chat: stage.aiChat,
    files: stage.files,
  };
};

const persistProjects = async (projects, role) => {
  for (const project of projects) {
    const { error: projectError } = await supabase.from("projects").upsert({
      id: project.id,
      student_id: project.studentId,
      class_id: project.classId || null,
      title: project.title,
      subject: project.subject,
      archived: project.archived,
      updated_at: new Date().toISOString(),
    });
    if (projectError) throw projectError;

    const { error: stagesError } = await supabase.from("project_stages").upsert(
      project.stages.map((stage, index) => stageToDatabaseRow(project.id, stage, index, role)),
      { onConflict: "project_id,stage_index" },
    );
    if (stagesError) throw stagesError;
  }
};

function App() {
  const [data, setData] = useState({ studentProjectId: null, projects: [] });
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [workspaceError, setWorkspaceError] = useState("");
  const [className, setClassName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedStage, setSelectedStage] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const saveTimer = useRef(null);
  const role = profile?.role || "student";

  const visibleProjects = useMemo(
    () =>
      role === "teacher"
        ? data.projects
        : data.projects.filter((project) => project.id === data.studentProjectId),
    [data.projects, data.studentProjectId, role],
  );
  const selectedProject = useMemo(
    () => visibleProjects.find((project) => project.id === selectedProjectId),
    [selectedProjectId, visibleProjects],
  );
  const stageState = selectedProject?.stages[selectedStage];
  const stageInfo = stages[selectedStage];
  const activeProjects = useMemo(
    () => visibleProjects.filter((project) => !project.archived),
    [visibleProjects],
  );
  const archivedProjects = useMemo(
    () => visibleProjects.filter((project) => project.archived),
    [visibleProjects],
  );

  useEffect(() => {
    const loadWorkspace = async (currentSession) => {
      if (!currentSession) {
        setProfile(null);
        setData({ studentProjectId: null, projects: [] });
        setWorkspaceReady(false);
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);
      setWorkspaceError("");
      const userId = currentSession.user.id;
      const { data: profileRow, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", userId)
        .single();

      if (profileError) {
        setWorkspaceError("Не удалось загрузить профиль пользователя.");
        setAuthLoading(false);
        return;
      }

      const [{ data: classRows, error: classesError }, { data: projectRows, error: projectsError }] =
        await Promise.all([
          supabase.from("classes").select("id, teacher_id, name, invite_code").order("created_at"),
          supabase.from("projects").select("*").order("updated_at", { ascending: false }),
        ]);

      if (classesError || projectsError) {
        setWorkspaceError("Не удалось загрузить данные из общей базы.");
        setAuthLoading(false);
        return;
      }

      const projectIds = (projectRows || []).map((project) => project.id);
      const studentIds = [...new Set((projectRows || []).map((project) => project.student_id))];
      const [{ data: stageRows }, { data: profileRows }] = await Promise.all([
        projectIds.length
          ? supabase.from("project_stages").select("*").in("project_id", projectIds)
          : Promise.resolve({ data: [] }),
        studentIds.length
          ? supabase.from("profiles").select("id, full_name").in("id", studentIds)
          : Promise.resolve({ data: [] }),
      ]);

      const names = Object.fromEntries((profileRows || []).map((item) => [item.id, item.full_name]));
      const projects = (projectRows || []).map((project) => ({
        id: project.id,
        studentId: project.student_id,
        classId: project.class_id,
        title: project.title,
        subject: project.subject,
        owner: names[project.student_id] || profileRow.full_name || "Ученик",
        updatedAt: project.updated_at,
        archived: project.archived,
        stages: stages.map((_, index) => {
          const row = (stageRows || []).find(
            (stage) => stage.project_id === project.id && stage.stage_index === index,
          );
          return normalizeStage(
            row
              ? {
                  status: row.status,
                  grade: row.grade?.toString() || "",
                  teacherComment: row.teacher_comment,
                  files: row.files,
                  aiChat: row.ai_chat,
                  diary: row.diary,
                  responseGrades: row.response_grades,
                }
              : undefined,
            index,
          );
        }),
      }));

      setSession(currentSession);
      setProfile(profileRow);
      setClasses(classRows || []);
      setData({ studentProjectId: profileRow.role === "student" ? projects[0]?.id || null : null, projects });
      setSelectedProjectId(projects[0]?.id || null);
      setWorkspaceReady(true);
      setAuthLoading(false);
    };

    supabase.auth.getSession().then(({ data: authData }) => loadWorkspace(authData.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      loadWorkspace(nextSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!workspaceReady || !session) return undefined;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await persistProjects(data.projects, role);
      } catch (error) {
        setWorkspaceError(`Ошибка сохранения: ${error.message}`);
      }
    }, 700);
    return () => clearTimeout(saveTimer.current);
  }, [data, role, session, workspaceReady]);

  const updateStage = (updater) => {
    setData((current) => ({
      ...current,
      projects: current.projects.map((project) => {
        if (project.id !== selectedProjectId) return project;
        return {
          ...project,
          updatedAt: "08.08.2026",
          stages: project.stages.map((stage, index) =>
            index === selectedStage ? updater(stage) : stage,
          ),
        };
      }),
    }));
  };

  const updateProjectDetails = (field, value) => {
    if (role !== "student") return;
    if (field === "owner") {
      setProfile((current) => ({ ...current, full_name: value }));
      supabase.from("profiles").update({ full_name: value }).eq("id", session.user.id);
    }
    setData((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === current.studentProjectId
          ? { ...project, [field]: value, updatedAt: "08.08.2026" }
          : project,
      ),
    }));
  };

  const handleFieldChange = (field, value) => {
    updateStage((stage) => ({
      ...stage,
      status: stage.status === "Не начат" ? "Черновик" : stage.status,
      diary: { ...stage.diary, [field]: value },
    }));
  };

  const handleResponseGradeChange = (field, grade) => {
    if (role !== "teacher") return;
    updateStage((stage) => ({
      ...stage,
      responseGrades: { ...stage.responseGrades, [field]: grade },
    }));
  };

  const submitStageForReview = async () => {
    if (role !== "student" || !selectedProject || !stageState) return;
    const submittedStage = { ...stageState, status: "На проверке" };
    updateStage(() => submittedStage);
    const { error } = await supabase.from("project_stages").upsert(
      stageToDatabaseRow(selectedProject.id, submittedStage, selectedStage, "student"),
      { onConflict: "project_id,stage_index" },
    );
    if (error) {
      window.alert(`Не удалось отправить этап: ${error.message}`);
      updateStage((stage) => ({ ...stage, status: "Черновик" }));
    }
  };

  const handleFiles = (fileList) => {
    const incoming = Array.from(fileList).map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type || "Файл",
    }));
    if (!incoming.length) return;
    updateStage((stage) => ({
      ...stage,
      files: [...stage.files, ...incoming],
      status: stage.status === "Не начат" ? "Черновик" : stage.status,
    }));
  };

  const sendAiMessage = (message = aiPrompt) => {
    const text = message.trim();
    if (!text) return;

    const aiReply =
      `Я помогу с этапом "${stageInfo.title}". Проверьте: 1) связана ли идея с целью этапа, ` +
      "2) какие физические понятия нужно уточнить, 3) что ученик сделал самостоятельно. " +
      "Для дневника лучше сохранить и сам запрос, и то, какие части ответа пришлось изменить.";

    updateStage((stage) => ({
      ...stage,
      status: stage.status === "Не начат" ? "Черновик" : stage.status,
      aiChat: [
        ...stage.aiChat,
        { id: `user-${Date.now()}`, role: "user", text },
        { id: `ai-${Date.now()}`, role: "ai", text: aiReply },
      ],
    }));
    setAiPrompt("");
  };

  const createProject = () => {
    if (role !== "student") return;
    if (!classes.length) {
      window.alert("Сначала подключитесь к классу по коду учителя.");
      return;
    }
    const id = crypto.randomUUID();
    const nextProject = {
      id,
      studentId: session.user.id,
      classId: classes[0].id,
      title: "Новый проект по физике",
      subject: "Тема не выбрана",
      owner: profile.full_name || "Ученик",
      updatedAt: "08.08.2026",
      archived: false,
      stages: stages.map((_, index) => createStageState(index)),
    };
    setData((current) => ({
      ...current,
      studentProjectId: role === "student" ? id : current.studentProjectId,
      projects: [nextProject, ...current.projects],
    }));
    setSelectedProjectId(id);
    setSelectedStage(0);
  };

  const archiveProject = (projectId) => {
    setData((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === projectId ? { ...project, archived: true } : project,
      ),
    }));

    if (selectedProjectId === projectId) {
      const nextProject = visibleProjects.find(
        (project) => project.id !== projectId && !project.archived,
      );
      setSelectedProjectId(nextProject?.id || projectId);
      setSelectedStage(0);
    }
  };

  const restoreProject = (projectId) => {
    setData((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === projectId ? { ...project, archived: false } : project,
      ),
    }));
    setSelectedProjectId(projectId);
    setSelectedStage(0);
  };

  const deleteProject = async (project) => {
    const confirmed = window.confirm(
      `Удалить проект «${project.title}»? Это действие нельзя отменить.`,
    );
    if (!confirmed) return;

    const { error } = await supabase.from("projects").delete().eq("id", project.id);
    if (error) {
      window.alert("Не удалось удалить проект из общей базы.");
      return;
    }

    const remainingProjects = data.projects.filter((item) => item.id !== project.id);
    setData((current) => ({
      ...current,
      studentProjectId:
        current.studentProjectId === project.id ? null : current.studentProjectId,
      projects: current.projects.filter((item) => item.id !== project.id),
    }));

    if (selectedProjectId === project.id) {
      const remainingVisibleProjects =
        role === "teacher"
          ? remainingProjects
          : remainingProjects.filter((item) => item.id === data.studentProjectId);
      const nextProject =
        remainingVisibleProjects.find((item) => !item.archived) || remainingVisibleProjects[0];
      setSelectedProjectId(nextProject?.id);
      setSelectedStage(0);
    }
  };

  const createClass = async () => {
    const name = className.trim();
    if (!name) return;
    const { data: createdClass, error } = await supabase
      .from("classes")
      .insert({ teacher_id: session.user.id, name })
      .select("id, teacher_id, name, invite_code")
      .single();
    if (error) {
      window.alert("Не удалось создать класс. Проверьте, что аккаунту назначена роль учителя.");
      return;
    }
    setClasses((current) => [...current, createdClass]);
    setClassName("");
  };

  const joinClass = async () => {
    const code = classCode.trim();
    if (!code) return;
    const { error } = await supabase.rpc("join_class", { class_code: code });
    if (error) {
      window.alert(`Не удалось подключиться к классу: ${error.message}`);
      return;
    }
    const { data: classRows } = await supabase
      .from("classes")
      .select("id, teacher_id, name, invite_code")
      .order("created_at");
    setClasses(classRows || []);
    setClassCode("");
  };

  const signOut = async () => {
    clearTimeout(saveTimer.current);
    try {
      await persistProjects(data.projects, role);
    } catch (error) {
      window.alert(`Не удалось сохранить изменения перед выходом: ${error.message}`);
      return;
    }
    await supabase.auth.signOut();
  };

  const classPanel = (
    <ClassPanel>
      <ClassPanelTitle><Users size={15} />{role === "teacher" ? "Мои классы" : "Мой класс"}</ClassPanelTitle>
      {role === "teacher" ? (
        <>
          <ClassForm>
            <input
              value={className}
              placeholder="Например, 7А"
              onChange={(event) => setClassName(event.target.value)}
            />
            <button type="button" onClick={createClass}>Создать</button>
          </ClassForm>
          {classes.map((item) => (
            <ClassInfo key={item.id}>
              <strong>{item.name}</strong>
              <span>Код: <b>{item.invite_code}</b></span>
            </ClassInfo>
          ))}
        </>
      ) : classes.length ? (
        classes.map((item) => <ClassInfo key={item.id}><strong>{item.name}</strong><span>Вы подключены</span></ClassInfo>)
      ) : (
        <ClassForm>
          <input
            value={classCode}
            placeholder="Код класса"
            onChange={(event) => setClassCode(event.target.value.toUpperCase())}
          />
          <button type="button" onClick={joinClass}>Подключиться</button>
        </ClassForm>
      )}
    </ClassPanel>
  );

  const renderProjectCard = (project) => {
    const done = project.stages.filter((stage) => stage.status === "Принят").length;
    return (
      <ProjectCard key={project.id} active={project.id === selectedProjectId}>
        <ProjectSelect
          type="button"
          onClick={() => {
            setSelectedProjectId(project.id);
            setSelectedStage(0);
          }}
        >
          <ProjectTitle>{project.title}</ProjectTitle>
          <ProjectMeta>{project.subject}</ProjectMeta>
          <ProgressRow>
            <ProgressBar>
              <ProgressFill width={(done / stages.length) * 100} />
            </ProgressBar>
            <ProgressText>{done}/8</ProgressText>
          </ProgressRow>
        </ProjectSelect>
        <ProjectActions>
          {project.archived ? (
            <ProjectAction type="button" onClick={() => restoreProject(project.id)}>
              <ArchiveRestore size={14} />
              Восстановить
            </ProjectAction>
          ) : (
            <ProjectAction type="button" onClick={() => archiveProject(project.id)}>
              <Archive size={14} />
              В архив
            </ProjectAction>
          )}
          <ProjectAction $danger type="button" onClick={() => deleteProject(project)}>
            <Trash2 size={14} />
            Удалить
          </ProjectAction>
        </ProjectActions>
      </ProjectCard>
    );
  };

  if (authLoading) return <LoadingScreen>Загрузка приложения…</LoadingScreen>;
  if (!session) return <AuthScreen />;
  if (workspaceError) return <LoadingScreen>{workspaceError}</LoadingScreen>;

  if (!selectedProject || !stageState) {
    return (
      <Shell>
        <Header>
          <Brand>
            <BrandMark><Sparkles size={18} /></BrandMark>
            <div>
              <ProductName>Дневник проекта по физике</ProductName>
              <ProductHint>Дневник проектной деятельности</ProductHint>
            </div>
          </Brand>
          <HeaderActions>
            <UserBadge>{role === "teacher" ? <GraduationCap size={16} /> : <UserRound size={16} />}{profile.full_name || session.user.email}</UserBadge>
            <LogoutButton type="button" onClick={signOut}><LogOut size={16} />Выйти</LogoutButton>
          </HeaderActions>
        </Header>
        <Main>
          <Sidebar>
            <SidebarTop>
              <SidebarTitle><LayoutDashboard size={17} />Dashboard</SidebarTitle>
              {role === "student" && <IconButton aria-label="Создать проект" title="Создать проект" onClick={createProject}><Plus size={18} /></IconButton>}
            </SidebarTop>
            {classPanel}
          </Sidebar>
          <EmptyWorkspace>
            <h1>Проектов пока нет</h1>
            <p>Создайте новый проект кнопкой «+» на Dashboard.</p>
          </EmptyWorkspace>
        </Main>
      </Shell>
    );
  }

  return (
    <Shell>
      <Header>
        <Brand>
          <BrandMark>
            <Sparkles size={18} />
          </BrandMark>
          <div>
            <ProductName>Дневник проекта по физике</ProductName>
            <ProductHint>Дневник проектной деятельности</ProductHint>
          </div>
        </Brand>
        <HeaderActions>
          <Autosave>
            <CheckCircle2 size={16} />
            Черновик сохранен
          </Autosave>
          <Segmented aria-label="Роль пользователя">
            <UserBadge>{role === "teacher" ? <GraduationCap size={16} /> : <UserRound size={16} />}{profile.full_name || session.user.email}</UserBadge>
            <LogoutButton type="button" onClick={signOut}><LogOut size={16} />Выйти</LogoutButton>
          </Segmented>
        </HeaderActions>
      </Header>

      <Main>
        <Sidebar>
          <SidebarTop>
            <SidebarTitle>
              <LayoutDashboard size={17} />
              Dashboard
            </SidebarTitle>
            {role === "student" && <IconButton aria-label="Создать проект" title="Создать проект" onClick={createProject}><Plus size={18} /></IconButton>}
          </SidebarTop>

          {classPanel}

          <ProjectList>
            {activeProjects.map(renderProjectCard)}
          </ProjectList>

          {!!archivedProjects.length && (
            <ArchiveSection>
              <ArchiveTitle>Архив</ArchiveTitle>
              <ProjectList>{archivedProjects.map(renderProjectCard)}</ProjectList>
            </ArchiveSection>
          )}
        </Sidebar>

        <Workspace>
          <TimelineHeader>
            <BackPill>
              <ArrowLeft size={16} />
              {selectedProject.owner}
            </BackPill>
            <TitleBlock>
              <h1>{selectedProject.title}</h1>
              <p>Восемь этапов проекта, дневник ученика, комментарии учителя и зафиксированный вклад ИИ.</p>
              {role === "student" && (
                <StudentProjectFields>
                  <StudentProjectField>
                    <span>Имя ученика</span>
                    <ProfileInput
                      value={selectedProject.owner}
                      placeholder="Введите свое имя"
                      onChange={(event) => updateProjectDetails("owner", event.target.value)}
                    />
                  </StudentProjectField>
                  <StudentProjectField>
                    <span>Тема проекта</span>
                    <ProfileInput
                      value={selectedProject.title}
                      placeholder="Введите название темы"
                      onChange={(event) => updateProjectDetails("title", event.target.value)}
                    />
                  </StudentProjectField>
                </StudentProjectFields>
              )}
            </TitleBlock>
          </TimelineHeader>

          <Timeline>
            {stages.map((stage, index) => (
              <StageButton
                key={stage.title}
                active={index === selectedStage}
                completed={selectedProject.stages[index].status === "Принят"}
                onClick={() => {
                  setSelectedStage(index);
                }}
              >
                <StageIndex completed={selectedProject.stages[index].status === "Принят"}>
                  {selectedProject.stages[index].status === "Принят" ? <Check size={14} /> : index + 1}
                </StageIndex>
                <span>{stage.title}</span>
              </StageButton>
            ))}
          </Timeline>

          <StageGrid>
            <StageMain>
              <StageIntro>
                <StageKicker>Этап {selectedStage + 1}</StageKicker>
                <h2>{stageInfo.title}</h2>
                <p>{stageInfo.description}</p>
                <Goal>
                  <ClipboardCheck size={18} />
                  <span>{stageInfo.goal}</span>
                </Goal>
              </StageIntro>

              <RoleTable>
                <thead>
                  <tr>
                    <th>Роль</th>
                    <th>Задача</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <RoleLabel>
                        <GraduationCap size={16} />
                        Учитель
                      </RoleLabel>
                    </td>
                    <td>{stageInfo.tasks.teacher}</td>
                  </tr>
                  <tr>
                    <td>
                      <RoleLabel>
                        <Bot size={16} />
                        Генеративный ИИ
                      </RoleLabel>
                    </td>
                    <td>{stageInfo.tasks.ai}</td>
                  </tr>
                  <tr>
                    <td>
                      <RoleLabel>
                        <UserRound size={16} />
                        Ученик
                      </RoleLabel>
                    </td>
                    <td>{stageInfo.tasks.student}</td>
                  </tr>
                </tbody>
              </RoleTable>

              <AiAssistant>
                <SectionHeading>
                  <div>
                    <h3>ИИ-помощник</h3>
                    <p>Диалог сохраняется в этапе и помогает фиксировать вклад генеративного ИИ.</p>
                  </div>
                </SectionHeading>
                <QuickPrompts>
                  {[
                    "Помоги уточнить цель этапа",
                    "Какие ошибки могут быть в рассуждении?",
                    "Составь вопросы для самопроверки",
                  ].map((prompt) => (
                    <QuickPromptButton key={prompt} type="button" onClick={() => sendAiMessage(prompt)}>
                      <Lightbulb size={15} />
                      {prompt}
                    </QuickPromptButton>
                  ))}
                </QuickPrompts>
                <ChatLog>
                  {stageState.aiChat.length ? (
                    stageState.aiChat.map((message) => (
                      <ChatBubble key={message.id} role={message.role}>
                        <ChatAuthor>{message.role === "ai" ? "ИИ" : "Ученик"}</ChatAuthor>
                        <p>{message.text}</p>
                      </ChatBubble>
                    ))
                  ) : (
                    <EmptyChat>
                      <Bot size={22} />
                      <span>Задайте вопрос по текущему этапу проекта.</span>
                    </EmptyChat>
                  )}
                </ChatLog>
                <ChatComposer>
                  <ChatInput
                    value={aiPrompt}
                    placeholder="Например: помоги сформулировать гипотезу для опыта с маятником"
                    onChange={(event) => setAiPrompt(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        sendAiMessage();
                      }
                    }}
                  />
                  <PrimaryButton type="button" onClick={() => sendAiMessage()}>
                    <Send size={17} />
                    Спросить
                  </PrimaryButton>
                </ChatComposer>
              </AiAssistant>

              <DiarySection>
                <SectionHeading>
                  <div>
                    <h3>Электронный дневник</h3>
                    <p>Ответы и выставленные за них оценки автоматически сохраняются.</p>
                  </div>
                </SectionHeading>
                {fields.map((field) => (
                  <FieldGroup key={field}>
                    <FieldHeader>
                      <label htmlFor={field}>{field}</label>
                      {role === "teacher" ? (
                        <ResponseGradeSelect
                          aria-label={`Оценка за ответ: ${field}`}
                          value={stageState.responseGrades[field]}
                          onChange={(event) =>
                            handleResponseGradeChange(field, event.target.value)
                          }
                        >
                          <option value="">Оценка</option>
                          {[1, 2, 3, 4, 5].map((grade) => (
                            <option key={grade} value={grade}>{grade}</option>
                          ))}
                        </ResponseGradeSelect>
                      ) : (
                        <ResponseGrade $graded={Boolean(stageState.responseGrades[field])}>
                          {stageState.responseGrades[field]
                            ? `Оценка: ${stageState.responseGrades[field]}`
                            : "Не оценено"}
                        </ResponseGrade>
                      )}
                    </FieldHeader>
                    <Textarea
                      id={field}
                      value={stageState.diary[field]}
                      disabled={role === "teacher"}
                      placeholder="Напишите ответ"
                      onChange={(event) => handleFieldChange(field, event.target.value)}
                    />
                  </FieldGroup>
                ))}

                <DropZone
                  dragging={dragging}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    handleFiles(event.dataTransfer.files);
                  }}
                >
                  <UploadCloud size={24} />
                  <strong>Перетащите файлы сюда</strong>
                  <span>или выберите материалы исследования, таблицы, изображения и черновики</span>
                  <HiddenInput
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={(event) => handleFiles(event.target.files)}
                  />
                  <FileButton htmlFor="file-upload">
                    <FilePlus2 size={16} />
                    Выбрать файлы
                  </FileButton>
                </DropZone>

                {!!stageState.files.length && (
                  <FileList>
                    {stageState.files.map((file) => (
                      <FileItem key={file.id}>
                        <FilePlus2 size={16} />
                        <span>{file.name}</span>
                        <small>{Math.max(1, Math.round(file.size / 1024))} КБ</small>
                      </FileItem>
                    ))}
                  </FileList>
                )}

                <SubmitRow>
                  <PrimaryButton
                    disabled={role !== "student" || stageState.status === "На проверке"}
                    onClick={submitStageForReview}
                  >
                    {stageState.status === "На проверке" ? <Check size={17} /> : <Send size={17} />}
                    {stageState.status === "На проверке"
                      ? "Отправлено учителю"
                      : "Отправить учителю"}
                  </PrimaryButton>
                </SubmitRow>
              </DiarySection>
            </StageMain>

            <TeacherPanel>
              <PanelSticky>
                <PanelHeader>
                  <MessageSquareText size={18} />
                  Проверка учителя
                </PanelHeader>
                <StatusPill status={stageState.status}>{stageState.status}</StatusPill>
                <TeacherField>
                  <label htmlFor="teacher-comment">Комментарий</label>
                  <TeacherTextarea
                    id="teacher-comment"
                    disabled={role === "student"}
                    value={stageState.teacherComment}
                    placeholder="Комментарий к дневнику ученика"
                    onChange={(event) =>
                      updateStage((stage) => ({ ...stage, teacherComment: event.target.value }))
                    }
                  />
                </TeacherField>
                <TeacherField>
                  <label htmlFor="status">Статус</label>
                  <Select
                    id="status"
                    disabled={role === "student"}
                    value={stageState.status}
                    onChange={(event) =>
                      updateStage((stage) => ({ ...stage, status: event.target.value }))
                    }
                  >
                    <option>Не начат</option>
                    <option>Черновик</option>
                    <option>На проверке</option>
                    <option>На доработке</option>
                    <option>Принят</option>
                  </Select>
                </TeacherField>
                <TeacherField>
                  <label htmlFor="grade">Оценка</label>
                  <Input
                    id="grade"
                    disabled={role === "student"}
                    value={stageState.grade}
                    placeholder="Например: 5"
                    onChange={(event) =>
                      updateStage((stage) => ({ ...stage, grade: event.target.value }))
                    }
                  />
                </TeacherField>
                <ButtonGrid>
                  <SecondaryButton
                    disabled={role === "student"}
                    onClick={() =>
                      updateStage((stage) => ({ ...stage, status: "На доработке" }))
                    }
                  >
                    <RefreshCcw size={16} />
                    Вернуть
                  </SecondaryButton>
                  <PrimaryButton
                    disabled={role === "student"}
                    onClick={() => updateStage((stage) => ({ ...stage, status: "Принят" }))}
                  >
                    <Check size={16} />
                    Принять
                  </PrimaryButton>
                </ButtonGrid>
              </PanelSticky>
            </TeacherPanel>
          </StageGrid>
        </Workspace>
      </Main>
    </Shell>
  );
}

const Shell = styled.div`
  min-height: 100vh;
  color: var(--ink);
`;

const LoadingScreen = styled.div`
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 24px;
  color: var(--muted);
  background: #f8fafc;
  font-weight: 700;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  min-height: 72px;
  padding: 14px 28px;
  border-bottom: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(14px);

  @media (max-width: 760px) {
    align-items: flex-start;
    flex-direction: column;
    padding: 16px;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BrandMark = styled.div`
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  color: #ffffff;
  background: var(--blue);
`;

const ProductName = styled.div`
  font-size: 17px;
  font-weight: 760;
`;

const ProductHint = styled.div`
  margin-top: 2px;
  color: var(--muted);
  font-size: 13px;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const UserBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  padding: 0 10px;
  color: #334155;
  font-size: 13px;
  font-weight: 700;
`;

const LogoutButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 34px;
  padding: 0 10px;
  border: 0;
  border-radius: 6px;
  color: #64748b;
  background: #ffffff;
  font-size: 13px;
  font-weight: 700;
`;

const Autosave = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 36px;
  color: var(--green);
  font-size: 13px;
  font-weight: 650;
`;

const Segmented = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 3px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel);
`;

const RoleButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 34px;
  padding: 0 12px;
  border: 0;
  border-radius: 6px;
  color: ${({ active }) => (active ? "var(--blue)" : "var(--muted)")};
  background: ${({ active }) => (active ? "#ffffff" : "transparent")};
  box-shadow: ${({ active }) => (active ? "0 1px 2px rgba(15, 23, 42, 0.08)" : "none")};
  font-size: 13px;
  font-weight: 700;
`;

const Main = styled.main`
  display: grid;
  grid-template-columns: 308px minmax(0, 1fr);
  min-height: calc(100vh - 72px);

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  border-right: 1px solid var(--line);
  background: #fbfcfe;
  padding: 24px;

  @media (max-width: 980px) {
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }
`;

const SidebarTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 16px;
`;

const SidebarTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #334155;
  font-size: 14px;
  font-weight: 760;
`;

const ClassPanel = styled.section`
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: #ffffff;
`;

const ClassPanelTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  color: #334155;
  font-size: 13px;
  font-weight: 800;
`;

const ClassForm = styled.div`
  display: grid;
  gap: 8px;

  input {
    min-width: 0;
    min-height: 36px;
    padding: 0 9px;
    border: 1px solid var(--line);
    border-radius: 7px;
    outline: none;
  }

  button {
    min-height: 34px;
    border: 0;
    border-radius: 7px;
    color: #ffffff;
    background: var(--blue);
    font-size: 12px;
    font-weight: 750;
  }
`;

const ClassInfo = styled.div`
  display: grid;
  gap: 3px;
  padding: 9px;
  border-radius: 7px;
  background: #f8fafc;
  font-size: 12px;

  span { color: var(--muted); }
  b { color: var(--blue); letter-spacing: .08em; }
`;

const IconButton = styled.button`
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--line);
  border-radius: 7px;
  color: var(--blue);
  background: #ffffff;
`;

const ProjectList = styled.div`
  display: grid;
  gap: 10px;

  @media (max-width: 980px) {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }
`;

const ProjectCard = styled.div`
  width: 100%;
  border: 1px solid ${({ active }) => (active ? "#bfdbfe" : "var(--line)")};
  border-radius: 8px;
  overflow: hidden;
  background: ${({ active }) => (active ? "var(--blue-soft)" : "#ffffff")};
  box-shadow: ${({ active }) => (active ? "0 10px 24px rgba(37, 99, 235, 0.08)" : "none")};
`;

const ProjectSelect = styled.button`
  width: 100%;
  min-height: 124px;
  padding: 16px;
  border: 0;
  text-align: left;
  color: inherit;
  background: transparent;
`;

const ProjectActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  border-top: 1px solid var(--line);
  background: var(--line);
`;

const ProjectAction = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 36px;
  padding: 6px 8px;
  border: 0;
  color: ${({ $danger }) => ($danger ? "#b91c1c" : "#475569")};
  background: #ffffff;
  font-size: 12px;
  font-weight: 700;

  &:hover {
    background: ${({ $danger }) => ($danger ? "#fef2f2" : "#f8fafc")};
  }
`;

const ArchiveSection = styled.section`
  display: grid;
  gap: 10px;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
`;

const ArchiveTitle = styled.h2`
  margin: 0;
  color: var(--muted);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const ProjectTitle = styled.div`
  color: #0f172a;
  font-size: 16px;
  font-weight: 780;
`;

const ProjectMeta = styled.div`
  margin-top: 7px;
  color: var(--muted);
  font-size: 13px;
`;

const ProgressRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 10px;
  margin-top: 22px;
`;

const ProgressBar = styled.div`
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: #e2e8f0;
`;

const ProgressFill = styled.div`
  width: ${({ width }) => width}%;
  height: 100%;
  background: var(--blue);
`;

const ProgressText = styled.span`
  color: var(--muted);
  font-size: 12px;
  font-weight: 750;
`;

const Workspace = styled.section`
  min-width: 0;
  padding: 30px;

  @media (max-width: 760px) {
    padding: 18px 16px;
  }
`;

const EmptyWorkspace = styled.section`
  display: grid;
  place-content: center;
  gap: 8px;
  min-height: calc(100vh - 72px);
  padding: 30px;
  text-align: center;

  h1,
  p {
    margin: 0;
  }

  p {
    color: var(--muted);
  }
`;

const TimelineHeader = styled.div`
  display: grid;
  gap: 18px;
  max-width: 1180px;
  margin: 0 auto;
`;

const BackPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  color: var(--muted);
  font-size: 13px;
  font-weight: 700;
`;

const TitleBlock = styled.div`
  display: grid;
  gap: 8px;

  h1 {
    margin: 0;
    font-size: clamp(30px, 5vw, 52px);
    line-height: 1.02;
    letter-spacing: 0;
  }

  p {
    max-width: 760px;
    margin: 0;
    color: var(--muted);
    font-size: 16px;
    line-height: 1.6;
  }
`;

const StudentProjectFields = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  max-width: 760px;
  margin-top: 10px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const StudentProjectField = styled.label`
  display: grid;
  gap: 7px;
  color: #334155;
  font-size: 12px;
  font-weight: 750;
`;

const ProfileInput = styled.input`
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--ink);
  background: #ffffff;
  font: inherit;
  font-size: 14px;
  font-weight: 500;

  &:focus {
    outline: 2px solid #bfdbfe;
    border-color: #60a5fa;
  }
`;

const Timeline = styled.nav`
  display: grid;
  grid-template-columns: repeat(8, minmax(132px, 1fr));
  gap: 8px;
  max-width: 1180px;
  margin: 26px auto;
  overflow-x: auto;
  padding-bottom: 4px;
`;

const StageButton = styled.button`
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 132px;
  min-height: 54px;
  padding: 8px 10px;
  border: 1px solid ${({ active }) => (active ? "#93c5fd" : "var(--line)")};
  border-radius: 8px;
  color: ${({ active }) => (active ? "var(--blue)" : "#334155")};
  background: ${({ active }) => (active ? "var(--blue-soft)" : "#ffffff")};
  font-size: 12px;
  font-weight: 750;
  line-height: 1.25;
  text-align: left;

  span:last-child {
    min-width: 0;
    overflow-wrap: anywhere;
  }
`;

const StageIndex = styled.span`
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  color: ${({ completed }) => (completed ? "#ffffff" : "var(--blue)")};
  background: ${({ completed }) => (completed ? "var(--green)" : "#dbeafe")};
  font-size: 12px;
`;

const StageGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  align-items: start;
  gap: 24px;
  max-width: 1180px;
  margin: 0 auto;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr;
  }
`;

const StageMain = styled.div`
  display: grid;
  gap: 22px;
  min-width: 0;
`;

const StageIntro = styled.section`
  padding: 28px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #ffffff;

  h2 {
    margin: 8px 0 10px;
    font-size: 28px;
    line-height: 1.15;
    letter-spacing: 0;
  }

  p {
    margin: 0;
    color: var(--muted);
    line-height: 1.65;
  }
`;

const StageKicker = styled.div`
  color: var(--blue);
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
`;

const Goal = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 18px;
  padding: 13px 14px;
  border-radius: 8px;
  color: #1d4ed8;
  background: var(--blue-soft);
  font-weight: 700;
  line-height: 1.45;
`;

const RoleTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #ffffff;

  th,
  td {
    padding: 16px;
    border-bottom: 1px solid var(--line);
    text-align: left;
    vertical-align: top;
  }

  th {
    color: var(--muted);
    background: #f8fafc;
    font-size: 12px;
    text-transform: uppercase;
  }

  td {
    line-height: 1.55;
  }

  tr:last-child td {
    border-bottom: 0;
  }

  @media (max-width: 680px) {
    th,
    td {
      padding: 12px;
    }
  }
`;

const RoleLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 170px;
  color: #0f172a;
  font-weight: 760;
`;

const AiAssistant = styled.section`
  display: grid;
  gap: 16px;
  padding: 22px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #fbfdff;
`;

const QuickPrompts = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const QuickPromptButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  padding: 0 11px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  color: #1d4ed8;
  background: #ffffff;
  font-size: 13px;
  font-weight: 720;
`;

const ChatLog = styled.div`
  display: grid;
  gap: 10px;
  min-height: 150px;
  max-height: 320px;
  overflow-y: auto;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #ffffff;
`;

const ChatBubble = styled.div`
  justify-self: ${({ role }) => (role === "ai" ? "start" : "end")};
  width: min(86%, 620px);
  padding: 12px 13px;
  border: 1px solid ${({ role }) => (role === "ai" ? "#dbeafe" : "#cbd5e1")};
  border-radius: 8px;
  color: #243045;
  background: ${({ role }) => (role === "ai" ? "var(--blue-soft)" : "#f8fafc")};
  line-height: 1.55;

  p {
    margin: 4px 0 0;
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const ChatAuthor = styled.div`
  color: var(--blue);
  font-size: 12px;
  font-weight: 800;
`;

const EmptyChat = styled.div`
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
  min-height: 126px;
  color: var(--muted);
  text-align: center;
  font-size: 14px;
`;

const ChatComposer = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ChatInput = styled.textarea`
  min-height: 44px;
  max-height: 130px;
  resize: vertical;
  padding: 11px 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  outline: none;
  line-height: 1.45;

  &:focus {
    border-color: #93c5fd;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
  }
`;

const DiarySection = styled.section`
  display: grid;
  gap: 18px;
  padding: 24px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #ffffff;
`;

const SectionHeading = styled.div`
  h3 {
    margin: 0;
    font-size: 20px;
    letter-spacing: 0;
  }

  p {
    margin: 6px 0 0;
    color: var(--muted);
    font-size: 14px;
  }
`;

const FieldGroup = styled.div`
  display: grid;
  gap: 8px;
`;

const FieldHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  label {
    font-size: 14px;
    font-weight: 760;
  }
`;

const ResponseGradeSelect = styled.select`
  min-height: 32px;
  padding: 0 9px;
  border: 1px solid #93c5fd;
  border-radius: 7px;
  color: var(--blue);
  background: var(--blue-soft);
  font-size: 12px;
  font-weight: 750;
`;

const ResponseGrade = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid ${({ $graded }) => ($graded ? "#86efac" : "var(--line)")};
  border-radius: 999px;
  color: ${({ $graded }) => ($graded ? "#15803d" : "var(--muted)")};
  background: ${({ $graded }) => ($graded ? "#f0fdf4" : "#f8fafc")};
  font-size: 12px;
  font-weight: 750;
  white-space: nowrap;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 132px;
  resize: vertical;
  padding: 14px 15px;
  border: 1px solid var(--line);
  border-radius: 8px;
  outline: none;
  color: var(--ink);
  background: ${({ disabled }) => (disabled ? "#f8fafc" : "#ffffff")};
  line-height: 1.55;

  &:focus {
    border-color: #93c5fd;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
  }
`;

const DropZone = styled.div`
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 30px 18px;
  border: 1.5px dashed ${({ dragging }) => (dragging ? "var(--blue)" : "#cbd5e1")};
  border-radius: 8px;
  color: ${({ dragging }) => (dragging ? "var(--blue)" : "#475569")};
  background: ${({ dragging }) => (dragging ? "var(--blue-soft)" : "#fbfdff")};
  text-align: center;

  span {
    max-width: 520px;
    color: var(--muted);
    font-size: 13px;
    line-height: 1.45;
  }
`;

const HiddenInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
`;

const FileButton = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 36px;
  margin-top: 5px;
  padding: 0 12px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  color: var(--blue);
  background: #ffffff;
  font-size: 13px;
  font-weight: 760;
  cursor: pointer;
`;

const FileList = styled.div`
  display: grid;
  gap: 8px;
`;

const FileItem = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #ffffff;

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    color: var(--muted);
  }
`;

const SubmitRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px;
  border: 0;
  border-radius: 8px;
  color: #ffffff;
  background: var(--blue);
  font-weight: 760;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #334155;
  background: #ffffff;
  font-weight: 760;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

const TeacherPanel = styled.aside`
  min-width: 0;
`;

const PanelSticky = styled.div`
  position: sticky;
  top: 96px;
  display: grid;
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #ffffff;

  @media (max-width: 1080px) {
    position: static;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0f172a;
  font-weight: 800;
`;

const StatusPill = styled.div`
  display: inline-flex;
  width: fit-content;
  min-height: 30px;
  align-items: center;
  padding: 0 10px;
  border-radius: 999px;
  color: ${({ status }) =>
    status === "Принят"
      ? "var(--green)"
      : status === "На доработке"
        ? "var(--red)"
        : status === "На проверке"
          ? "var(--blue)"
          : "var(--amber)"};
  background: ${({ status }) =>
    status === "Принят"
      ? "#ecfdf5"
      : status === "На доработке"
        ? "#fef2f2"
        : status === "На проверке"
          ? "var(--blue-soft)"
          : "#fffbeb"};
  font-size: 13px;
  font-weight: 780;
`;

const TeacherField = styled.div`
  display: grid;
  gap: 7px;

  label {
    color: #334155;
    font-size: 13px;
    font-weight: 760;
  }
`;

const TeacherTextarea = styled.textarea`
  min-height: 138px;
  resize: vertical;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  outline: none;
  background: ${({ disabled }) => (disabled ? "#f8fafc" : "#ffffff")};
  line-height: 1.5;

  &:focus {
    border-color: #93c5fd;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
  }
`;

const Select = styled.select`
  min-height: 40px;
  padding: 0 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: ${({ disabled }) => (disabled ? "#f8fafc" : "#ffffff")};
  outline: none;
`;

const Input = styled.input`
  min-height: 40px;
  padding: 0 10px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: ${({ disabled }) => (disabled ? "#f8fafc" : "#ffffff")};
  outline: none;
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

export default App;

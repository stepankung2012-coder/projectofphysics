import React, { useState } from "react";
import styled from "@emotion/styled";
import { GraduationCap, LogIn, Sparkles, UserPlus } from "lucide-react";
import { supabase } from "./supabaseClient";

export default function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: window.location.href.split("#")[0].split("?")[0],
        },
      });
      if (signUpError) setError(signUpError.message);
      else setMessage("Проверьте почту и подтвердите регистрацию, затем войдите.");
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError("Не удалось войти. Проверьте почту и пароль.");
    }

    setSubmitting(false);
  };

  return (
    <Page>
      <Card>
        <BrandMark><Sparkles size={22} /></BrandMark>
        <Header>
          <h1>Дневник проекта по физике</h1>
          <p>{mode === "login" ? "Войдите в свой аккаунт" : "Регистрация ученика"}</p>
        </Header>

        <Tabs>
          <Tab type="button" active={mode === "login"} onClick={() => setMode("login")}>
            Вход
          </Tab>
          <Tab type="button" active={mode === "signup"} onClick={() => setMode("signup")}>
            Регистрация
          </Tab>
        </Tabs>

        <Form onSubmit={submit}>
          {mode === "signup" && (
            <Field>
              <span>Имя и фамилия</span>
              <input required value={fullName} onChange={(event) => setFullName(event.target.value)} />
            </Field>
          )}
          <Field>
            <span>Email</span>
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>
          <Field>
            <span>Пароль</span>
            <input
              required
              minLength={8}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {message && <SuccessMessage>{message}</SuccessMessage>}
          <SubmitButton disabled={submitting}>
            {mode === "login" ? <LogIn size={17} /> : <UserPlus size={17} />}
            {submitting ? "Подождите…" : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </SubmitButton>
        </Form>

        <TeacherHint>
          <GraduationCap size={17} />
          Аккаунт учителя создаётся администратором после регистрации.
        </TeacherHint>
      </Card>
    </Page>
  );
}

const Page = styled.main`
  display: grid;
  place-items: center;
  min-height: 100vh;
  padding: 24px;
  background: #f4f7fb;
`;

const Card = styled.section`
  width: min(100%, 440px);
  padding: 32px;
  border: 1px solid #dbe3ee;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.1);
`;

const BrandMark = styled.div`
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  margin-bottom: 18px;
  border-radius: 10px;
  color: #ffffff;
  background: var(--blue);
`;

const Header = styled.div`
  h1 { margin: 0; font-size: 26px; line-height: 1.15; }
  p { margin: 8px 0 0; color: var(--muted); }
`;

const Tabs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin: 24px 0;
  padding: 4px;
  border-radius: 9px;
  background: #f1f5f9;
`;

const Tab = styled.button`
  min-height: 38px;
  border: 0;
  border-radius: 7px;
  color: ${({ active }) => (active ? "var(--blue)" : "var(--muted)")};
  background: ${({ active }) => (active ? "#ffffff" : "transparent")};
  box-shadow: ${({ active }) => (active ? "0 1px 3px rgba(15, 23, 42, .1)" : "none")};
  font-weight: 750;
`;

const Form = styled.form`display: grid; gap: 16px;`;

const Field = styled.label`
  display: grid;
  gap: 7px;
  color: #334155;
  font-size: 13px;
  font-weight: 750;

  input {
    min-height: 44px;
    padding: 0 12px;
    border: 1px solid var(--line);
    border-radius: 8px;
    outline: none;
    font: inherit;
    font-weight: 500;
  }

  input:focus { border-color: #60a5fa; box-shadow: 0 0 0 3px #dbeafe; }
`;

const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  border: 0;
  border-radius: 8px;
  color: #ffffff;
  background: var(--blue);
  font-weight: 800;
  &:disabled { opacity: .65; }
`;

const ErrorMessage = styled.div`color: #b91c1c; font-size: 13px;`;
const SuccessMessage = styled.div`color: #15803d; font-size: 13px; line-height: 1.5;`;
const TeacherHint = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
`;

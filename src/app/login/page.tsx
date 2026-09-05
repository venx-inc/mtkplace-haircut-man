"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { SubmitButton } from "@/components/SubmitButton";
import { signIn, signUp, type AuthState } from "./actions";

const initialState: AuthState = { status: "idle" };

export default function LoginPage() {
  const [mode, setMode] = useState<"entrar" | "cadastrar">("entrar");
  const [signInState, signInAction] = useFormState(signIn, initialState);
  const [signUpState, signUpAction] = useFormState(signUp, initialState);

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="mb-8 flex gap-2 rounded-md bg-brand-50 p-1 text-sm font-medium">
        <button
          className={`flex-1 rounded px-4 py-2 ${mode === "entrar" ? "bg-white shadow-sm" : "text-ink/60"}`}
          onClick={() => setMode("entrar")}
        >
          Entrar
        </button>
        <button
          className={`flex-1 rounded px-4 py-2 ${mode === "cadastrar" ? "bg-white shadow-sm" : "text-ink/60"}`}
          onClick={() => setMode("cadastrar")}
        >
          Criar conta
        </button>
      </div>

      {mode === "entrar" ? (
        <form action={signInAction} className="space-y-3">
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            required
            className="w-full rounded-md border border-brand-200 px-4 py-2 text-sm"
          />
          <input
            type="password"
            name="password"
            placeholder="Senha"
            required
            className="w-full rounded-md border border-brand-200 px-4 py-2 text-sm"
          />
          {signInState.status === "error" && (
            <p className="text-sm text-red-600">{signInState.message}</p>
          )}
          <SubmitButton
            label="Entrar"
            pendingLabel="Entrando…"
            className="w-full rounded-md bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          />
        </form>
      ) : (
        <form action={signUpAction} className="space-y-3">
          <input
            type="text"
            name="fullName"
            placeholder="Nome completo"
            required
            className="w-full rounded-md border border-brand-200 px-4 py-2 text-sm"
          />
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            required
            className="w-full rounded-md border border-brand-200 px-4 py-2 text-sm"
          />
          <input
            type="password"
            name="password"
            placeholder="Senha"
            required
            minLength={6}
            className="w-full rounded-md border border-brand-200 px-4 py-2 text-sm"
          />
          <fieldset className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="role" value="cliente" defaultChecked /> Sou cliente
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="role" value="profissional" /> Sou profissional
            </label>
          </fieldset>
          {signUpState.status === "error" && (
            <p className="text-sm text-red-600">{signUpState.message}</p>
          )}
          <SubmitButton
            label="Criar conta"
            pendingLabel="Criando…"
            className="w-full rounded-md bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          />
        </form>
      )}
    </div>
  );
}

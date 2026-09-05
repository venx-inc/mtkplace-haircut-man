"use client";

import { useFormState } from "react-dom";
import { SubmitButton } from "@/components/SubmitButton";
import { createProfessional, type ProfessionalFormState } from "./actions";

const initialState: ProfessionalFormState = { status: "idle" };

export function CadastroForm() {
  const [state, formAction] = useFormState(createProfessional, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input
        type="text"
        name="businessName"
        placeholder="Nome do negócio (ex: Barbearia do Zé)"
        required
        className="w-full rounded-md border border-brand-200 px-4 py-2 text-sm"
      />
      <div className="flex gap-3">
        <input
          type="text"
          name="city"
          placeholder="Cidade"
          required
          className="w-1/2 rounded-md border border-brand-200 px-4 py-2 text-sm"
        />
        <input
          type="text"
          name="state"
          placeholder="UF"
          maxLength={2}
          required
          className="w-1/2 rounded-md border border-brand-200 px-4 py-2 text-sm uppercase"
        />
      </div>
      <textarea
        name="bio"
        placeholder="Conte um pouco sobre o seu trabalho"
        rows={4}
        className="w-full rounded-md border border-brand-200 px-4 py-2 text-sm"
      />
      {state.status === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}
      <SubmitButton
        label="Enviar para verificação"
        pendingLabel="Salvando…"
        className="rounded-md bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
      />
    </form>
  );
}

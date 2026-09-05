"use client";

import { useId, useState } from "react";
import { useFormState } from "react-dom";
import { SubmitButton } from "@/components/SubmitButton";
import { createProfessional, type ProfessionalFormState } from "./actions";

const initialState: ProfessionalFormState = { status: "idle" };

function ImagePicker({
  name,
  label,
  required,
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  const id = useId();
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-ink/70">
        {label}
      </label>
      <div className="flex items-center gap-3">
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="h-16 w-16 shrink-0 rounded-md border border-brand-100 object-cover"
          />
        )}
        <input
          id={id}
          type="file"
          name={name}
          accept="image/png,image/jpeg,image/webp"
          required={required}
          onChange={(e) => {
            const file = e.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
          className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700"
        />
      </div>
    </div>
  );
}

type CaseRow = { key: string };

export function CadastroForm() {
  const [state, formAction] = useFormState(createProfessional, initialState);
  const [cases, setCases] = useState<CaseRow[]>([]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-3">
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
      </div>

      <ImagePicker name="coverImage" label="Foto de capa" />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-ink/70">Casos antes e depois (opcional)</p>
          <button
            type="button"
            onClick={() => setCases((prev) => [...prev, { key: crypto.randomUUID() }])}
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            + adicionar caso
          </button>
        </div>

        {cases.map((row, index) => (
          <div key={row.key} className="space-y-3 rounded-md border border-brand-100 p-4">
            <div className="flex items-center justify-between">
              <input
                type="text"
                name={`case-${index}-title`}
                placeholder="Título do caso (ex: Barba cheia em 3 meses)"
                className="w-full rounded-md border border-brand-200 px-4 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => setCases((prev) => prev.filter((c) => c.key !== row.key))}
                className="ml-3 shrink-0 text-sm text-ink/50 hover:text-red-600"
              >
                remover
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ImagePicker name={`case-${index}-before`} label="Antes" />
              <ImagePicker name={`case-${index}-after`} label="Depois" />
            </div>
          </div>
        ))}

        <input type="hidden" name="caseCount" value={cases.length} />
      </div>

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

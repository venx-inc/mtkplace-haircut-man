"use client";

import { useFormState } from "react-dom";
import { SubmitButton } from "@/components/SubmitButton";
import { sendContactRequest, type ContactFormState } from "./actions";

const initialState: ContactFormState = { status: "idle" };

export function ContactForm({ professionalId }: { professionalId: string }) {
  const [state, formAction] = useFormState(sendContactRequest, initialState);

  if (state.status === "success") {
    return (
      <p className="rounded-md border border-brand-200 bg-brand-50 p-4 text-sm text-brand-700">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="professionalId" value={professionalId} />
      <input
        type="text"
        name="clientName"
        placeholder="Seu nome"
        required
        className="w-full rounded-md border border-brand-200 px-4 py-2 text-sm"
      />
      <input
        type="tel"
        name="clientPhone"
        placeholder="Seu WhatsApp"
        required
        className="w-full rounded-md border border-brand-200 px-4 py-2 text-sm"
      />
      <input
        type="email"
        name="clientEmail"
        placeholder="Seu e-mail (opcional)"
        className="w-full rounded-md border border-brand-200 px-4 py-2 text-sm"
      />
      <textarea
        name="message"
        placeholder="O que você procura?"
        rows={3}
        className="w-full rounded-md border border-brand-200 px-4 py-2 text-sm"
      />
      {state.status === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}
      <SubmitButton
        label="Enviar solicitação"
        pendingLabel="Enviando…"
        className="rounded-md bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
      />
    </form>
  );
}

"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { SubmitButton } from "@/components/SubmitButton";
import { submitReview, type ReviewFormState } from "./actions";

const initialState: ReviewFormState = { status: "idle" };

export function ReviewForm({
  professionalId,
  slug,
}: {
  professionalId: string;
  slug: string;
}) {
  const [state, formAction] = useFormState(submitReview, initialState);
  const [rating, setRating] = useState(5);

  if (state.status === "success") {
    return (
      <p className="rounded-md border border-brand-200 bg-brand-50 p-3 text-sm text-brand-700">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-md border border-brand-100 p-4">
      <input type="hidden" name="professionalId" value={professionalId} />
      <input type="hidden" name="slug" value={slug} />

      <div>
        <p className="mb-1 text-xs font-medium text-ink/70">Sua nota</p>
        <div className="flex gap-1" role="radiogroup" aria-label="Nota">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-pressed={rating === value}
              className={`text-xl ${value <= rating ? "text-brand-500" : "text-ink/20"}`}
            >
              ★
            </button>
          ))}
        </div>
        <input type="hidden" name="rating" value={rating} />
      </div>

      <textarea
        name="comment"
        placeholder="Conte como foi o atendimento (opcional)"
        rows={3}
        className="w-full rounded-md border border-brand-200 px-4 py-2 text-sm"
      />

      {state.status === "error" && <p className="text-sm text-red-600">{state.message}</p>}

      <SubmitButton
        label="Enviar avaliação"
        pendingLabel="Enviando…"
        className="rounded-md bg-brand-500 px-5 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
      />
    </form>
  );
}

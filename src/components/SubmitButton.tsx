"use client";

import { useFormStatus } from "react-dom";

/**
 * Precisa ser renderizado DENTRO do <form> que ele controla — useFormStatus só
 * enxerga o form quando o hook roda em um componente filho dele, não no mesmo
 * componente que declara o <form action={...}>.
 */
export function SubmitButton({
  label,
  pendingLabel,
  className,
}: {
  label: string;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : label}
    </button>
  );
}

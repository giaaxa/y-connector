"use client";

import { RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button, ButtonLink } from "./button";

export function ErrorView({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div role="alert" className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sun-soft text-xl">!</span>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Something went wrong.</h1>
      <p className="mt-3 text-muted">We couldn&apos;t load this page. Try again, and if it keeps happening, let us know.</p>
      {error.digest && <p className="mt-2 font-mono text-xs text-subtle">Ref: {error.digest}</p>}
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}><RotateCcw className="h-4 w-4" /> Try again</Button>
        <ButtonLink href="/contact" variant="outline">Contact us</ButtonLink>
      </div>
    </div>
  );
}

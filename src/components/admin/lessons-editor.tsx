"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input, Select, Textarea } from "@/components/ui/form";
import type { Lesson } from "@/lib/types";

type Row = Lesson & { key: string };

/** Repeating lesson rows posted as parallel arrays (lessonTitle[], lessonKind[], …). */
export function LessonsEditor({ initial }: { initial: Lesson[] }) {
  const [rows, setRows] = useState<Row[]>(initial.map((l) => ({ ...l, key: l.id })));
  const move = (i: number, d: number) =>
    setRows((r) => {
      const n = [...r];
      const j = i + d;
      if (j < 0 || j >= n.length) return r;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  return (
    <div className="space-y-3">
      {rows.map((l, i) => (
        <div key={l.key} className="rounded-2xl border border-line p-4">
          <input type="hidden" name="lessonId" value={l.id} />
          <div className="grid gap-3 sm:grid-cols-[1fr_130px_90px_auto]">
            <Input name="lessonTitle" defaultValue={l.title} placeholder={`Lesson ${i + 1} title`} aria-label="Lesson title" />
            <Select name="lessonKind" defaultValue={l.kind} aria-label="Lesson type">
              <option value="text">Text</option>
              <option value="video">Video link</option>
              <option value="pdf">PDF</option>
              <option value="link">External resource</option>
            </Select>
            <Input name="lessonMinutes" type="number" min={1} defaultValue={l.minutes} aria-label="Minutes" />
            <div className="flex gap-1">
              <button type="button" onClick={() => move(i, -1)} aria-label="Move up" className="rounded-lg p-2 hover:bg-fog"><ArrowUp className="h-4 w-4" /></button>
              <button type="button" onClick={() => move(i, 1)} aria-label="Move down" className="rounded-lg p-2 hover:bg-fog"><ArrowDown className="h-4 w-4" /></button>
              <button type="button" onClick={() => setRows((r) => r.filter((x) => x.key !== l.key))} aria-label="Remove lesson" className="rounded-lg p-2 text-bad hover:bg-[#fdf1f0]"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
          <Input name="lessonUrl" defaultValue={l.url} placeholder="https:// (video, PDF or resource URL)" className="mt-3" aria-label="Lesson URL" />
          <Textarea name="lessonBody" defaultValue={l.body} placeholder="Lesson text. Use ## for headings, - for bullets." className="mt-3 min-h-24" aria-label="Lesson body" />
        </div>
      ))}
      <button
        type="button"
        onClick={() => setRows((r) => [...r, { id: "", key: crypto.randomUUID(), title: "", kind: "text", body: "", url: "", minutes: 10 }])}
        className="inline-flex items-center gap-2 rounded-full border border-dashed border-ink/30 px-4 py-2 text-sm font-medium hover:border-ink"
      >
        <Plus className="h-4 w-4" /> Add lesson
      </button>
    </div>
  );
}

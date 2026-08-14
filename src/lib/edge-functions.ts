import { supabase } from "@/lib/supabase";

async function extractErrorMessage(error: unknown): Promise<string> {
  if (error && typeof error === "object" && "context" in error) {
    const context = (error as { context?: unknown }).context;
    if (context instanceof Response) {
      try {
        const body = await context.json();
        if (body?.error) return body.error as string;
      } catch {
        // fall through
      }
    }
  }
  if (error instanceof Error) return error.message;
  return "Xatolik yuz berdi";
}

export async function callEdgeFunction<T>(functionName: string, payload: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(functionName, { body: payload });
  if (error) throw new Error(await extractErrorMessage(error));
  if (data?.error) throw new Error(data.error as string);
  return data as T;
}

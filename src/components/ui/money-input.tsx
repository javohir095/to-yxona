import * as React from "react";
import { Input } from "@/components/ui/input";

function formatWithSpaces(digits: string) {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export const MoneyInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> & {
    value: number;
    onChange: (value: number) => void;
  }
>(function MoneyInput({ value, onChange, ...props }, ref) {
  const displayValue = formatWithSpaces(String(value ?? 0).replace(/\D/g, ""));

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = event.target.value.replace(/\D/g, "");
    onChange(digitsOnly === "" ? 0 : Number(digitsOnly));
  }

  return (
    <Input ref={ref} inputMode="numeric" autoComplete="off" value={displayValue} onChange={handleChange} {...props} />
  );
});

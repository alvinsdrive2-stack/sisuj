"use client";

import { ReactNode } from "react";
import { ToastProvider } from "@/contexts/ToastContext";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <ToastProvider>{children}</ToastProvider>;
}

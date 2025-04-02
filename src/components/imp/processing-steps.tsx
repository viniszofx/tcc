"use client"

import { CheckCircle2, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export interface ProcessingStep {
  id: string
  label: string
  status: "waiting" | "processing" | "completed" | "error"
  progress?: number
}

interface ProcessingStepsProps {
  steps: ProcessingStep[]
  currentStep: string
}

export function ProcessingSteps({ steps, currentStep }: ProcessingStepsProps) {
  return (
    <div className="space-y-4">
      {steps.map((step) => (
        <div key={step.id} className="flex items-center gap-3">
          {step.status === "completed" ? (
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
          ) : step.status === "processing" ? (
            <Loader2 className="h-5 w-5 animate-spin shrink-0" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 shrink-0" />
          )}
          <div className="flex-1 space-y-1">
            <div className="text-sm font-medium">{step.label}</div>
            {step.status === "processing" && step.progress !== undefined && (
              <Progress value={step.progress} className="h-2" />
            )}
          </div>
          {step.status === "processing" && step.progress !== undefined && (
            <div className="text-sm text-muted-foreground">{Math.round(step.progress)}%</div>
          )}
        </div>
      ))}
    </div>
  )
}


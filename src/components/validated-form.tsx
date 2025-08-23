"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { z } from "zod";

interface ValidatedFormProps<T extends Record<string, any>> {
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void>;
  children: (props: {
    register: (name: keyof T) => {
      name: string;
      value: any;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      onBlur: () => void;
    };
    errors: Record<keyof T, string | undefined>;
    isSubmitting: boolean;
  }) => React.ReactNode;
  defaultValues?: Partial<T>;
  className?: string;
}

export function ValidatedForm<T extends Record<string, any>>({
  schema,
  onSubmit,
  children,
  defaultValues = {},
  className = "",
}: ValidatedFormProps<T>) {
  const [values, setValues] = useState<T>(defaultValues as T);
  const [errors, setErrors] = useState<Record<keyof T, string | undefined>>({} as Record<keyof T, string | undefined>);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateField = (name: keyof T, value: any) => {
    try {
      const fieldSchema = schema.shape[name as string];
      if (fieldSchema) {
        fieldSchema.parse(value);
        return undefined;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors[0]?.message;
      }
    }
    return undefined;
  };

  const register = (name: keyof T) => ({
    name: name as string,
    value: values[name] || "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValues(prev => ({ ...prev, [name]: newValue }));
      
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
      }
    },
    onBlur: () => {
      const fieldError = validateField(name, values[name]);
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    try {
      // Validate all fields
      const result = schema.safeParse(values);
      
      if (!result.success) {
        const fieldErrors: Record<keyof T, string | undefined> = {} as Record<keyof T, string | undefined>;
        result.error.errors.forEach((error) => {
          const field = error.path[0] as keyof T;
          fieldErrors[field] = error.message;
        });
        setErrors(fieldErrors);
        return;
      }

      setIsSubmitting(true);
      await onSubmit(result.data);
    } catch (error: any) {
      setSubmitError(error.message || "An error occurred while submitting the form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {submitError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}
      
      {children({
        register,
        errors,
        isSubmitting,
      })}
    </form>
  );
}
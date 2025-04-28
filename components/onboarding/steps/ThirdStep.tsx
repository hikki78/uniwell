import {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { workspaceSchema, WorkspaceSchema } from "@/schema/workspaceSchema";
import { useOnboardingForm } from "@/context/OnboardingForm";
import { useTranslations } from "next-intl";
import { ActionType } from "@/types/onBoardingContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const ThirdStep = () => {
  const form = useForm<WorkspaceSchema>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      workspaceName: "",
    },
  });

  const { currentStep, dispatch } = useOnboardingForm();
  const t = useTranslations("ONBOARDING_FORM");

  const onSubmit = async (data: WorkspaceSchema) => {
    dispatch({ type: ActionType.WORKSPACE_NAME, payload: data.workspaceName });
    dispatch({ type: ActionType.CHANGE_SITE, payload: currentStep + 1 });
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center gap-4 w-full my-10 text-center">
        <h2 className="font-bold text-4xl md:text-5xl max-w-md">
          {t("THIRD_STEP.TITLE")}
        </h2>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-md space-y-8 mt-12"
        >
          <div className="space-y-1.5">
            <FormField
              name="workspaceName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">
                    {t("THIRD_STEP.INPUTS.NAME")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="bg-muted"
                      placeholder={t("THIRD_STEP.PLACEHOLDERS.NAME")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-10 max-w-md dark:text-white font-semibold"
          >
            {t("NEXT_BTN")}
            <ArrowRight className="ml-2" width={18} height={18} />
          </Button>
        </form>
      </Form>
    </>
  );
};

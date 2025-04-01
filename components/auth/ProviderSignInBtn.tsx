"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { useLocale } from "next-intl";
import { useProviderLoginError } from "@/hooks/useProviderLoginError";
import { signIn } from "next-auth/react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  providerName: "google" | "github";
  onLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ProviderSignInBtn = ({
  children,
  providerName,
  onLoading,
  ...props
}: Props) => {
  const [showLoggedInfo, setShowLoggedInfo] = useState(false);
  const locale = useLocale();
  useProviderLoginError(showLoggedInfo);

  const signInHandler = async () => {
    onLoading(true);
    setShowLoggedInfo(true);
    try {
      // Use direct provider sign-in with redirect: true for OAuth providers
      // This is different from credentials provider and should work with redirect: true
      await signIn(providerName, { 
        callbackUrl: `/onboarding`
      });
    } catch (err) {}
    onLoading(false);
  };

  return (
    <Button
      onClick={signInHandler}
      {...props}
      variant={"secondary"}
      type="button"
    >
      {children}
    </Button>
  );
};

import { AppleLogo } from "../svg/AppleLogo";
// import { GithubLogo } from "../svg/GithubLogo";
// import { GoogleLogo } from "../svg/GoogleLogo";
import { ProviderSignInBtn } from "./ProviderSignInBtn";
import { useTranslations } from "next-intl";

export const ProviderSignInBtns = ({
  signInCard,
  disabled,
  onLoading,
}: {
  signInCard?: boolean;
  disabled?: boolean;
  onLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const t = useTranslations("AUTH");
  return (
    <div className="flex flex-col gap-2">
      {/* Google login removed */}
      {/* <ProviderSignInBtn
        disabled={disabled}
        className="w-full bg-black/90 text-white dark:bg-black/70 hover:bg-black/80 dark:hover:bg-black/50  rounded-[1.9rem] border text-sm h-12 sm:h-10 sm:text-base"
      >
        <AppleLogo className="fill-white mr-2" width={20} height={20} />
        {signInCard
          ? t("SIGN_IN.PROVIDERS.APPLE")
          : t("SIGN_UP.PROVIDERS.APPLE")}
      </ProviderSignInBtn> */}
      {/* GitHub login removed */}
    </div>
  );
};

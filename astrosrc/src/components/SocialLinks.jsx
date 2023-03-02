import clsx from "clsx";

import {
  GitHubIcon,
  LinkedInIcon,
  TwitterIcon,
  MailIcon,
} from "./SocialIcons.jsx";

function SocialLink({ className, href, children, icon: Icon }) {
  return (
    <li className={clsx(className, "flex")}>
      <a
        href={href}
        className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
      >
        <Icon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500" />
        <span className="ml-4">{children}</span>
      </a>
    </li>
  );
}

export function SocialLinks({ navigation }) {
  return (
    <>
      <SocialLink href="https://twitter.com/sealjay_clj" icon={TwitterIcon}>
        Follow on Twitter
      </SocialLink>
      <SocialLink
        href="https://github.com/sealjay"
        icon={GitHubIcon}
        className="mt-4"
      >
        Follow on GitHub
      </SocialLink>
      <SocialLink
        href="https://uk.linkedin.com/in/chrislloydjones"
        icon={LinkedInIcon}
        className="mt-4"
      >
        Follow on LinkedIn
      </SocialLink>
      <SocialLink
        href="https://uk.linkedin.com/in/chrislloydjones"
        icon={MailIcon}
        className="mt-8 border-t border-zinc-100 pt-8 dark:border-zinc-700/40"
      >
        You can contact me on LinkedIn
      </SocialLink>
    </>
  );
}

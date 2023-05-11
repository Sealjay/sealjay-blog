import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'

import { Container } from '@/components/Container'
import {
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  TwitterIcon,
} from '@/components/SocialIcons'
import portraitImage from '@/images/portrait.jpg'

function SocialLink({ className, href, children, icon: Icon }) {
  return (
    <li className={clsx(className, 'flex')}>
      <Link
        href={href}
        className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
      >
        <Icon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500" />
        <span className="ml-4">{children}</span>
      </Link>
    </li>
  )
}

function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M6 5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6Zm.245 2.187a.75.75 0 0 0-.99 1.126l6.25 5.5a.75.75 0 0 0 .99 0l6.25-5.5a.75.75 0 0 0-.99-1.126L12 12.251 6.245 7.187Z"
      />
    </svg>
  )
}

export default function About() {
  return (
    <>
      <Head>
        <title>About - Chris Lloyd-Jones, Sealjay</title>
        <meta name="description" content="I’m Chris Lloyd-Jones, Sealjay. " />
      </Head>
      <Container className="mt-16 sm:mt-32">
        <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
          <div className="lg:pl-20">
            <div className="max-w-xs px-2.5 lg:max-w-none">
              <Image
                src={portraitImage}
                alt=""
                sizes="(min-width: 1024px) 32rem, 20rem"
                className="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800"
              />
            </div>
          </div>
          <div className="lg:order-first lg:row-span-2">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
              I&apos;m Chris Lloyd-Jones, Sealjay. I live in London
            </h1>
            <div className="mt-6 space-y-7 text-base text-zinc-600 dark:text-zinc-400">
              <p>
                I work at Avanade - I&apos;m the Head of Open Innovation, which
                means focussing on an ecossytem of academia, foundations, and
                start-ups; it also encompasses Avanade’s Open-Source projects
                office and developer relations team.
              </p>
              <p>
                I started my career working in local government, with a brief
                stint at the Financial Ombudsman Service. I transitioned
                careers, and since then I&apos;ve focussed on data, analytics,
                and emerging technologies.
              </p>
              <p>
                These days, I focus on scaling capabilities, or working with
                open source organisations like the TODO Group, the Green
                Software Foundation, and LF Europe.
              </p>
              <p>
                I&apos;m a Microsoft MVP in AI, the Chief Blueprints Officer for
                OpenUK, as well as supporting various roles at the Green
                Software Foundation: the Vice-Chair of the Oversight Committee,
                Co-Chair of the Open Source Working Group, and a Steering
                Committee member.
              </p>
            </div>
          </div>
          <div className="lg:pl-20">
            <ul role="list">
              <SocialLink
                href="https://twitter.com/sealjay_clj"
                icon={TwitterIcon}
              >
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
            </ul>
          </div>
        </div>
      </Container>
    </>
  )
}

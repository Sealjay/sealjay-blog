import Head from 'next/head'

import { SimpleLayout } from '@/components/SimpleLayout'

export default function ThankYou() {
  return (
    <>
      <Head>
        <title>Thank you - Chris Lloyd-Jones, Sealjay</title>
        <meta
          name="description"
          content="Thanks for subscribing to my newsletter."
        />
      </Head>
      <SimpleLayout title="Image 1">
        Photo by{' '}
        <a href="https://unsplash.com/@mischievous_penguins?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
          Casey Horner
        </a>{' '}
        on{' '}
        <a href="https://unsplash.com/s/photos/sustainability?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
          Unsplash
        </a>
      </SimpleLayout>

      <SimpleLayout title="Image 2">
        Photo by{' '}
        <a href="https://unsplash.com/@christopher__burns?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
          Christopher Burns
        </a>{' '}
        on{' '}
        <a href="https://unsplash.com/s/photos/future?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
          Unsplash
        </a>
      </SimpleLayout>
      <SimpleLayout title="Image 3">
        Photo by{' '}
        <a href="https://unsplash.com/@ryoji__iwata?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
          Ryoji Iwata
        </a>{' '}
        on{' '}
        <a href="https://unsplash.com/images/people/society?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
          Unsplash
        </a>
      </SimpleLayout>
      <SimpleLayout title="Image 4">
        Photo by{' '}
        <a href="https://unsplash.com/@_louisreed?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
          Louis Reed
        </a>{' '}
        on{' '}
        <a href="https://unsplash.com/s/photos/robotics?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
          Unsplash
        </a>
      </SimpleLayout>
      <SimpleLayout title="Image 5">
        Photo by{' '}
        <a href="https://unsplash.com/@ethandow?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
          Ethan Dow
        </a>{' '}
        on{' '}
        <a href="https://unsplash.com/s/photos/open-source?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
          Unsplash
        </a>
      </SimpleLayout>
    </>
  )
}

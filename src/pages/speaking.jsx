import Head from 'next/head'

import { Card } from '@/components/Card'
import { Section } from '@/components/Section'
import { SimpleLayout } from '@/components/SimpleLayout'

function SpeakingSection({ children, ...props }) {
  return (
    <Section {...props}>
      <div className="space-y-16">{children}</div>
    </Section>
  )
}

function Appearance({ title, description, event, cta, href }) {
  return (
    <Card as="article">
      <Card.Title as="h3" href={href}>
        {title}
      </Card.Title>
      <Card.Eyebrow decorate>{event}</Card.Eyebrow>
      <Card.Description>{description}</Card.Description>
      <Card.Cta>{cta}</Card.Cta>
    </Card>
  )
}

export default function Speaking() {
  return (
    <>
      <Head>
        <title>Speaking - Chris Lloyd-Jones, Sealjay</title>
        <meta
          name="description"
          content="I speak at events, share my insights and learn from others."
        />
      </Head>
      <SimpleLayout
        title="I speak at events, share my insights and learn from others."
        intro="I'm passionate about open-source, green software, and Microsoft AI:  you can find here previous conference talks, media mentions, and other speaking engagements."
      >
        <div className="space-y-20">
          <SpeakingSection title="Conferences">
            <Appearance
              href="https://em360tech.com/video-resources/biggest-challenge-sustainability-measurement-chris-lloyd-jones-avanade-state-open"
              title="The Biggest Challenge for Sustainability is Measurement"
              description="An interview with em360 about open data's role in sustainability efforts."
              event="State of Open Con 2023, February 2023"
              cta="Watch video"
              date="2033-02-07"
            />
          </SpeakingSection>
          <div className="hidden">
            <SpeakingSection title="Podcasts">
              <Appearance
                href="#"
                title="Using design as a competitive advantage"
                description="How we used world-class visual design to attract a great team, win over customers, and get more press for Planetaria."
                event="Encoding Design, July 2022"
                cta="Listen to podcast"
              />
            </SpeakingSection>
          </div>
          <SpeakingSection title="Other media">
            <Appearance
              href="https://www.eiols.tv/olspreviewh.aspx?Int=627892-C2"
              title="Combating deepfakes"
              description="How to spot deepfake videos – and why you should care"
              event="BBC World Service, June 2019"
              date="2019-6-13"
              time="11:36"
              cta="Watch on BBC News"
            />
          </SpeakingSection>
        </div>
      </SimpleLayout>
    </>
  )
}

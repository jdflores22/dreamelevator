import { Target, Eye } from 'lucide-react';
import { useSiteStats } from '@/api/hooks';
import { PageSEO } from '@/components/common/PageSEO';
import {
  AboutStatementSection,
  parseImagePosition,
} from '@/components/marketing/AboutStatementSection';
import { useSiteSettingsMap } from '@/hooks/useSiteSettingsMap';
import { useAboutSectionsVisibility } from '@/hooks/useSectionContent';
import { resolveMediaUrl } from '@/utils/media';
import { AboutHero } from '@/pages/About/sections/AboutHero';
import { AboutStorySection } from '@/pages/About/sections/AboutStorySection';
import { AboutValuesSection, parseCoreValues } from '@/pages/About/sections/AboutValuesSection';
import { AboutAssessmentSection } from '@/pages/About/sections/AboutAssessmentSection';
import { AboutStatsSection } from '@/pages/About/sections/AboutStatsSection';
import { AboutWhySection } from '@/pages/About/sections/AboutWhySection';
import { AboutIndustriesSection } from '@/pages/About/sections/AboutIndustriesSection';

export default function AboutPage() {
  const { get } = useSiteSettingsMap();
  const sections = useAboutSectionsVisibility();
  const { data: siteStats } = useSiteStats();

  const companyName = get('company_name');
  const heroImage = resolveMediaUrl(
    get('about_hero_image') || '/uploads/pages/about-us-page-edited.png',
  );

  const mission = get('about_mission');
  const vision = get('about_vision');
  const missionImage = resolveMediaUrl(get('about_mission_image') || '/uploads/pages/mission-img-2.jpg');
  const visionImage = resolveMediaUrl(get('about_vision_image') || '/uploads/pages/vision-img-1.jpg');
  const missionImagePosition = parseImagePosition(get('about_mission_image_position'), 'right');
  const visionImagePosition = parseImagePosition(get('about_vision_image_position'), 'left');

  const storyEyebrow = get('about_story_eyebrow');
  const storyTitle = get('about_story_title');
  const intro = get('about_intro');
  const secondary = get('about_secondary');
  const storyPhotos = [
    get('about_story_image') || '/uploads/pages/about-us-01.png',
    get('about_story_image_2') || '/uploads/pages/about-us-02.png',
    get('about_story_image_3') || '/uploads/pages/about-us-03.png',
  ]
    .map((src) => resolveMediaUrl(src))
    .filter(Boolean);

  const values = parseCoreValues(get('about_values') || get('home_why_title'));
  const valuesEyebrow = get('about_values_eyebrow') || get('home_why_eyebrow');
  const valuesTitle = get('about_values_title');
  const assessmentTitle = get('about_assessment_title');
  const assessmentBody = get('about_assessment_body');
  const controlsNote = get('about_controls_note');

  const showHeroStatsBar = sections.about_stats_bar && !sections.about_stats;

  return (
    <>
      <PageSEO
        pageKey="about"
        title={companyName ? `About Us | ${companyName}` : 'About Us'}
        description={intro || get('about_page_subtitle')}
      />

      <AboutHero
        heroImage={heroImage || undefined}
        showStatsBar={showHeroStatsBar}
        stats={siteStats ?? []}
      />

      {sections.about_story && (storyTitle || intro || secondary) ? (
        <AboutStorySection
          eyebrow={storyEyebrow}
          title={storyTitle}
          intro={intro}
          secondary={secondary}
          photos={storyPhotos}
          values={values}
        />
      ) : null}

      {values.length > 0 ? (
        <AboutValuesSection eyebrow={valuesEyebrow} title={valuesTitle} values={values} />
      ) : null}

      {sections.about_mission && mission ? (
        <AboutStatementSection
          sectionId="about_mission"
          eyebrow="Our mission"
          body={mission}
          icon={Target}
          imageUrl={missionImage || undefined}
          imagePosition={missionImagePosition}
          variant="mission"
        />
      ) : null}

      {sections.about_vision && vision ? (
        <AboutStatementSection
          sectionId="about_vision"
          eyebrow="Our vision"
          body={vision}
          icon={Eye}
          imageUrl={visionImage || undefined}
          imagePosition={visionImagePosition}
          variant="vision"
        />
      ) : null}

      {assessmentTitle || assessmentBody || controlsNote ? (
        <AboutAssessmentSection
          title={assessmentTitle}
          body={assessmentBody}
          note={controlsNote}
        />
      ) : null}

      {sections.about_stats && <AboutStatsSection stats={siteStats ?? []} />}

      {sections.about_why && <AboutWhySection />}

      {sections.about_industries && <AboutIndustriesSection />}
    </>
  );
}

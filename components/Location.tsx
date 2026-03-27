import Container from "./Container";
import SectionHeader from "./SectionHeader";

type LocationProps = {
  mapsEmbedUrl: string;
  locationHint: string;
  hoursLabel: string;
  address: string;
};

export default function Location({
  mapsEmbedUrl,
  locationHint,
  hoursLabel,
  address
}: LocationProps) {
  return (
    <section id="location" className="py-16">
      <Container className="space-y-8">
        <SectionHeader
          eyebrow="Location"
          title={locationHint}
          subtitle={`${hoursLabel} · ${address}`}
        />
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5">
          <iframe
            title="Restaurant location"
            src={mapsEmbedUrl}
            width="100%"
            height="320"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-80 w-full border-0"
          />
        </div>
      </Container>
    </section>
  );
}

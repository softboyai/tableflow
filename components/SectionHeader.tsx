type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
};

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left"
}: SectionHeaderProps) {
  const alignment =
    align === "center"
      ? "text-center items-center"
      : "text-left items-start";

  return (
    <div className={`flex flex-col gap-3 ${alignment}`}>
      {eyebrow ? (
        <span className="tf-eyebrow">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-balance font-display text-4xl leading-[0.94] text-ivory sm:text-5xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-2xl text-sm leading-7 text-ivory/68 sm:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

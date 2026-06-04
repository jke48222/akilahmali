import { Reveal } from "./Reveal";

type PageHeaderProps = {
  title: string;
  className?: string;
};

export function PageHeader({
  title,
  className = "",
}: PageHeaderProps) {
  return (
    <section className={`relative pt-28 md:pt-36 lg:pt-40 ${className}`.trim()}>
      <div className="mx-auto max-w-page px-gutter md:px-gutter-md lg:px-gutter-lg">
        <Reveal as="div">
          <h1
            className="font-display leading-[0.9] tracking-display"
            style={{ fontSize: "clamp(72px, 12vw, 180px)" }}
          >
            {title}
          </h1>
        </Reveal>
      </div>
    </section>
  );
}

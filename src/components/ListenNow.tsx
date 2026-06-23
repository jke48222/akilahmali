import { site } from "@/lib/site";
import SpotifyEmbed from "./SpotifyEmbed";
import LayloCard from "./LayloCard";
import SiteImg from "./SiteImg";
import SigTitle from "./SigTitle";
import Reveal from "./Reveal";

export default function ListenNow() {
  return (
    <section
      className="relative overflow-hidden bg-lavender bg-repeat py-20 md:py-28"
      style={{ backgroundImage: `url(${site.assets.bgLavender})` }}
    >
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-10 px-6 md:px-10 lg:grid-cols-[1fr_0.85fr]">
        {/* Left: title + stacked Spotify cards */}
        <div>
          <Reveal>
            <SigTitle tone="white" className="text-7xl md:text-8xl">
              Listen Now
            </SigTitle>
          </Reveal>

          <Reveal variant="stagger" className="mt-8 flex flex-col gap-5">
            {site.homeListen.map((item) => (
              <Reveal as="div" key={item.id}>
                <SpotifyEmbed
                  type={item.type as "track" | "artist"}
                  id={item.id}
                  height={item.height}
                />
              </Reveal>
            ))}
          </Reveal>
        </div>

        {/* Right: Laylo card + real black silhouette graphic */}
        <div className="relative">
          <Reveal>
            <LayloCard className="max-w-[420px]" />
          </Reveal>
          <SiteImg
            src={site.assets.pixieMermaid}
            className="pointer-events-none absolute -right-2 top-24 hidden w-44 opacity-95 lg:block xl:w-56"
          />
        </div>
      </div>
    </section>
  );
}

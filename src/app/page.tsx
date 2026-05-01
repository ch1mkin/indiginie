import { Landing } from "@/components/marketing/landing";
import { PublicChrome } from "@/components/marketing/public-chrome";

export default async function Home() {
  return (
    <PublicChrome>
      <Landing />
    </PublicChrome>
  );
}

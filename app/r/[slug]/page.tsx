import { notFound } from "next/navigation";
import Events from "@/components/Events";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import Hero from "@/components/Hero";
import JoinClubForm from "@/components/JoinClubForm";
import Location from "@/components/Location";
import MenuExperience from "@/components/MenuExperience";
import Promotion from "@/components/Promotion";
import QuickActions from "@/components/QuickActions";
import RestaurantScanTracker from "@/components/RestaurantScanTracker";
import SignatureDishes from "@/components/SignatureDishes";
import { toPhoneHref, toWhatsAppHref } from "@/lib/contact";
import { getRestaurantPageData } from "@/lib/restaurants";

type RestaurantRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RestaurantPage({
  params
}: RestaurantRouteProps) {
  const { slug } = await params;
  const pageData = await getRestaurantPageData(slug);

  if (!pageData) {
    notFound();
  }

  const { restaurant, signatureDishes, menuCategories, menuItems, events } = pageData;
  const whatsappHref = toWhatsAppHref(restaurant.whatsappNumber);
  const callHref = toPhoneHref(restaurant.phoneNumber);

  return (
    <main className="relative">
      <RestaurantScanTracker
        restaurantId={restaurant.id}
        slug={restaurant.slug}
      />
      <Hero
        restaurantName={restaurant.name}
        tagline={restaurant.tagline}
        heroImageUrl={restaurant.heroImageUrl}
        whatsappHref={whatsappHref}
      />
      <QuickActions whatsappHref={whatsappHref} callHref={callHref} />
      <SignatureDishes dishes={signatureDishes} />
      <Promotion
        restaurantId={restaurant.id}
        title={restaurant.promoTitle}
        description={restaurant.promoText}
      />
      <MenuExperience
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        whatsappHref={whatsappHref}
        phoneHref={callHref}
        categories={menuCategories}
        menuItems={menuItems}
      />
      <Events events={events} />
      <JoinClubForm
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
      />
      <Location
        mapsEmbedUrl={restaurant.mapsEmbedUrl}
        locationHint={restaurant.locationHint}
        hoursLabel={restaurant.hoursLabel}
        address={restaurant.address}
      />
      <FloatingWhatsApp whatsappHref={whatsappHref} />
    </main>
  );
}

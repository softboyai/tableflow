import { notFound } from "next/navigation";
import Events from "@/components/Events";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import Hero from "@/components/Hero";
import JoinClubForm from "@/components/JoinClubForm";
import Location from "@/components/Location";
import MenuExperience from "@/components/MenuExperience";
import Promotion from "@/components/Promotion";
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
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        tagline={restaurant.tagline}
        heroImageUrl={restaurant.heroImageUrl}
        whatsappHref={whatsappHref}
        callHref={callHref}
      />
      <Promotion
        restaurantId={restaurant.id}
        title={restaurant.promoTitle}
        description={restaurant.promoText}
      />
      {restaurant.leadCapturePlacement === "after_promo" ? (
        <JoinClubForm
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
          title={restaurant.leadCaptureTitle}
          description={restaurant.leadCaptureText}
          buttonLabel={restaurant.leadCaptureButtonText}
        />
      ) : null}
      <SignatureDishes dishes={signatureDishes} />
      <MenuExperience
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        whatsappHref={whatsappHref}
        phoneHref={callHref}
        categories={menuCategories}
        menuItems={menuItems}
      />
      <Events events={events} />
      {restaurant.leadCapturePlacement !== "after_promo" ? (
        <JoinClubForm
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
          title={restaurant.leadCaptureTitle}
          description={restaurant.leadCaptureText}
          buttonLabel={restaurant.leadCaptureButtonText}
        />
      ) : null}
      <Location
        mapsEmbedUrl={restaurant.mapsEmbedUrl}
        locationHint={restaurant.locationHint}
        hoursLabel={restaurant.hoursLabel}
        address={restaurant.address}
      />
      <FloatingWhatsApp
        restaurantId={restaurant.id}
        whatsappHref={whatsappHref}
      />
    </main>
  );
}

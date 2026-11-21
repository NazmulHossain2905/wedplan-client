import { ServiceDetailsView } from "@/components/services/service-details-view";
import { getActiveUser } from "@/server/guards";
import { redirect } from "next/navigation";

/**
 * Service details are a private route: unauthenticated (or blocked) visitors
 * are redirected to Sign In on the SERVER, before any content renders.
 * Browsing the public catalogue is still allowed without an account.
 */
export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getActiveUser();

  if (!user) {
    redirect(`/sign-in?redirect=${encodeURIComponent(`/services/${id}`)}`);
  }

  return <ServiceDetailsView serviceId={id} />;
}

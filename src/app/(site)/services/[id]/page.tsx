// import { redirect } from "next/navigation";
import { ServiceDetailsView } from "@/components/services/service-details-view";

/**
 * Service details — private route. Unauthenticated visitors are redirected
 * to Sign In (with a return path) on the SERVER, before any content renders.
 */
export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // const session = await readSessionToken();
  // if (!session) {
  //   redirect(`/sign-in?redirect=${encodeURIComponent(`/services/${id}`)}`);
  // }
  return <ServiceDetailsView serviceId={id} />;
}

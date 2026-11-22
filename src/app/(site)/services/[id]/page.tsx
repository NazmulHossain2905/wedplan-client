import { ServiceDetailsView } from "@/components/services/service-details-view";

/**
 * Service details are private; the proxy redirects guests to sign-in before
 * this page renders. Browsing the public catalogue stays open to everyone.
 */
export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ServiceDetailsView serviceId={id} />;
}

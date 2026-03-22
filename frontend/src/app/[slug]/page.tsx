import { notFound } from "next/navigation";

import { allFeatureSlugs, getFeature } from "@/config/navigation";
import { ProductPage } from "@/components/ProductPage";

export function generateStaticParams() {
  return allFeatureSlugs.map((slug) => ({ slug }));
}

export default async function FeatureRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const feature = getFeature((await params).slug);

  if (!feature) {
    notFound();
  }

  return <ProductPage feature={feature} />;
}

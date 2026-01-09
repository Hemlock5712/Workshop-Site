import { OptInOutOfCookies } from "@/components/AnalyticsOptInOut";

export default function MdxLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container justify-self-center prose dark:prose-invert mb-8">
      <OptInOutOfCookies />
      {children}
    </div>
  );
}

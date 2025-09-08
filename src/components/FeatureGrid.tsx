import ConceptBox from "@/components/ConceptBox";
import { ReactNode } from "react";

interface FeatureItem {
  title: ReactNode;
  subtitle?: ReactNode;
  content: ReactNode;
  code?: ReactNode;
  borderColorClass?: string;
}

interface FeatureGridProps {
  items: FeatureItem[];
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
}

export default function FeatureGrid({ items, columns = 3 }: FeatureGridProps) {
  const columnClassMap: Record<number, string> = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
  };
  const columnClass = columnClassMap[columns] ?? `md:grid-cols-${columns}`;
  return (
    <div className={`grid gap-6 ${columnClass}`}>
      {items.map((item, idx) => (
        <ConceptBox
          key={idx}
          title={item.title}
          subtitle={item.subtitle}
          code={item.code}
          borderColorClass={item.borderColorClass}
        >
          {item.content}
        </ConceptBox>
      ))}
    </div>
  );
}


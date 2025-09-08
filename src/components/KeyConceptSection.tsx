interface KeyConceptSectionProps {
  title: string;
  description: string;
  concept: string;
  children?: React.ReactNode;
}

export default function KeyConceptSection({ 
  title, 
  description, 
  concept, 
  children 
}: KeyConceptSectionProps) {
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 text-[var(--foreground)] rounded-lg p-8 border border-yellow-200 dark:border-yellow-800">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">{title}</h2>
      <p className="text-[var(--muted-foreground)] mb-4">
        {description}
      </p>
      <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg">
        <p className="text-green-800 dark:text-green-300 font-medium">
          🎯 Key Concept: {concept}
        </p>
      </div>
      {children}
    </div>
  );
}
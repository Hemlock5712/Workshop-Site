import ComparisonTable from "./ComparisonTable";

interface WalkthroughItem {
  title: string;
  items: string[];
}

interface CodeWalkthroughProps {
  leftSection: WalkthroughItem;
  rightSection: WalkthroughItem;
  nextStepText: string;
  className?: string;
}

export default function CodeWalkthrough({ 
  leftSection, 
  rightSection, 
  nextStepText,
  className = ""
}: CodeWalkthroughProps) {
  return (
    <div className={`bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 ${className}`}>
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">🔍 Code Walkthrough</h3>
      
      <ComparisonTable
        leftTitle={`${leftSection.title}:`}
        leftItems={leftSection.items}
        rightTitle={`${rightSection.title}:`}
        rightItems={rightSection.items}
        leftBlockClassName="text-slate-700 dark:text-slate-300"
        rightBlockClassName="text-slate-700 dark:text-slate-300"
        leftTitleClassName="font-semibold text-slate-800 dark:text-slate-200 mb-2"
        rightTitleClassName="font-semibold text-slate-800 dark:text-slate-200 mb-2"
      />

      <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded mt-4">
        <p className="text-slate-800 dark:text-slate-200 text-sm">
          <strong>💡 Next Step:</strong> {nextStepText}
        </p>
      </div>
    </div>
  );
}
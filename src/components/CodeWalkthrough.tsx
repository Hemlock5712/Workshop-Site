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
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{leftSection.title}:</h4>
          <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
            {leftSection.items.map((item, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{rightSection.title}:</h4>
          <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1">
            {rightSection.items.map((item, index) => (
              <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded mt-4">
        <p className="text-slate-800 dark:text-slate-200 text-sm">
          <strong>💡 Next Step:</strong> {nextStepText}
        </p>
      </div>
    </div>
  );
}
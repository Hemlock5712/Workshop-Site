interface ComparisonTableProps {
  leftTitle: string;
  leftItems: string[];
  rightTitle: string;
  rightItems: string[];
  className?: string;
  leftBlockClassName?: string;
  rightBlockClassName?: string;
  leftTitleClassName?: string;
  rightTitleClassName?: string;
  leftListClassName?: string;
  rightListClassName?: string;
}

export default function ComparisonTable({
  leftTitle,
  leftItems,
  rightTitle,
  rightItems,
  className = "",
  leftBlockClassName = "",
  rightBlockClassName = "",
  leftTitleClassName = "",
  rightTitleClassName = "",
  leftListClassName = "",
  rightListClassName = "",
}: ComparisonTableProps) {
  return (
    <div className={`grid md:grid-cols-2 gap-6 ${className}`}>
      <div className={leftBlockClassName}>
        <h4 className={leftTitleClassName}>{leftTitle}</h4>
        <ul className={`text-sm space-y-1 ${leftListClassName}`}>
          {leftItems.map((item, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      </div>
      <div className={rightBlockClassName}>
        <h4 className={rightTitleClassName}>{rightTitle}</h4>
        <ul className={`text-sm space-y-1 ${rightListClassName}`}>
          {rightItems.map((item, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      </div>
    </div>
  );
}

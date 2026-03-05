import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  descriptionClassName?: string;
  actionsClassName?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  className,
  descriptionClassName,
  actionsClassName,
}: PageHeaderProps) {
  return (
    <header className={cn("rounded-3xl bg-background inset-shadow-sm", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {description ? (
            <p className={cn("text-muted-foreground", descriptionClassName)}>{description}</p>
          ) : null}
        </div>

        {actions ? (
          <div
            className={cn(
              "shrink-0 rounded-2xl p-2",
              actionsClassName
            )}
          >
            <div className="flex items-stretch gap-2">{actions}</div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

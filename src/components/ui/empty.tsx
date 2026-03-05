import { Inbox, type LucideIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12",
        className
      )}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        "flex max-w-sm flex-col items-center gap-2 text-center",
        className
      )}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  "flex shrink-0 items-center justify-center mb-2 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn("text-lg font-medium tracking-tight", className)}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="empty-description"
      className={cn(
        "text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance",
        className
      )}
      {...props}
    />
  )
}

const emptyStateVariants = cva(
  "relative isolate overflow-hidden rounded-2xl border border-dashed bg-muted/20",
  {
    variants: {
      size: {
        default: "min-h-56 p-8 md:p-10",
        sm: "min-h-40 p-5 md:p-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function EmptyState({
  className,
  title,
  description,
  action,
  icon: Icon = Inbox,
  size = "default",
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof emptyStateVariants> & {
    title: string
    description?: string
    action?: React.ReactNode
    icon?: LucideIcon
  }) {
  return (
    <Empty className={cn(emptyStateVariants({ size }), className)} {...props}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-transparent to-primary/10" />
      <div className="pointer-events-none absolute -right-10 -top-10 -z-10 size-28 rounded-full bg-primary/10 blur-2xl" />

      <EmptyHeader className={cn("max-w-md", size === "sm" && "gap-1.5")}>
        <EmptyMedia
          variant="icon"
          className={cn(
            "size-14 rounded-2xl border border-border/70 bg-background text-primary shadow-xs [&_svg:not([class*='size-'])]:size-7",
            size === "sm" && "size-12 [&_svg:not([class*='size-'])]:size-6"
          )}
        >
          <Icon aria-hidden="true" />
        </EmptyMedia>

        <EmptyTitle className={cn(size === "sm" && "text-base")}>{title}</EmptyTitle>

        {description ? (
          <EmptyDescription className={cn(size === "sm" && "text-sm")}>
            {description}
          </EmptyDescription>
        ) : null}
      </EmptyHeader>

      {action ? (
        <EmptyContent className={cn(size === "sm" && "gap-3")}>{action}</EmptyContent>
      ) : null}
    </Empty>
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
  EmptyState,
}

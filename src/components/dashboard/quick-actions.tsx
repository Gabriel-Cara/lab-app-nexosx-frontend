import {
  type ButtonHTMLAttributes,
  type ElementType,
  forwardRef,
} from "react";
import { Link } from "react-router";
import {
  CalendarDays,
  ChevronRight,
  Package,
  User,
  UserPlus,
  Users,
  Volleyball,
} from "lucide-react";

import { AddModal as AddAreaModal } from "@/components/areas/add-modal";
import { AddModal as AddResidentModal } from "@/components/residents/add-modal";
import { AddModal as AddVisitorModal } from "@/components/visitors/add-modal";
import { ScheduleModal } from "@/components/areas/schedule-modal";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";

type DashboardQuickActionsProps = {
  role: UserRole;
  activeVisitorsCount: number;
  pendingPackagesCount: number;
  availableAreasCount: number;
  defaultAreaId: string | null;
};

type ActionTileVisualProps = {
  icon: ElementType;
  title: string;
  subtitle: string;
  bubbleClassName: string;
  iconClassName: string;
};

type ActionTileProps = ActionTileVisualProps &
  ButtonHTMLAttributes<HTMLButtonElement>;

type ActionLinkTileProps = ActionTileVisualProps & {
  to: string;
};

function ActionTileContent({
  icon: Icon,
  title,
  subtitle,
  bubbleClassName,
  iconClassName,
}: ActionTileVisualProps) {
  return (
    <>
      <div
        className={cn(
          "absolute -right-7 -top-7 h-20 w-20 rounded-full transition-all duration-400 ease-out",
          "group-hover:scale-[9] group-hover:translate-x-2 group-hover:-translate-y-2",
          bubbleClassName
        )}
      />
      <div className="relative z-10 flex h-full flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="rounded-xl bg-slate-100/90 p-2 transition-colors duration-300 group-hover:bg-white/20 dark:bg-slate-800/70 dark:group-hover:bg-black/20">
            <Icon
              className={cn(
                "size-5 transition-colors duration-300 group-hover:text-white",
                iconClassName
              )}
            />
          </div>
          <ChevronRight className="size-4 text-slate-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white dark:text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-slate-900 transition-colors duration-300 group-hover:text-white dark:text-slate-100">
            {title}
          </p>
          <p className="mt-1 text-xs text-slate-500 transition-colors duration-300 group-hover:text-white/85 dark:text-slate-400">
            {subtitle}
          </p>
        </div>
      </div>
    </>
  );
}

const ActionTile = forwardRef<HTMLButtonElement, ActionTileProps>(
  (
    {
      icon,
      title,
      subtitle,
      bubbleClassName,
      iconClassName,
      className,
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={cn(
          "group relative isolate h-full min-h-28 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm",
          "dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20",
          "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99]",
          "disabled:pointer-events-none disabled:opacity-55 disabled:hover:translate-y-0 disabled:hover:shadow-sm",
          className
        )}
        {...props}
      >
        <ActionTileContent
          icon={icon}
          title={title}
          subtitle={subtitle}
          bubbleClassName={bubbleClassName}
          iconClassName={iconClassName}
        />
      </button>
    );
  }
);

ActionTile.displayName = "ActionTile";

function ActionLinkTile({
  to,
  icon,
  title,
  subtitle,
  bubbleClassName,
  iconClassName,
}: ActionLinkTileProps) {
  return (
    <Link
      to={to}
      className={cn(
        "group relative isolate block h-full min-h-28 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm",
        "dark:border-slate-800 dark:bg-slate-950/70 dark:shadow-black/20",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99]"
      )}
    >
      <ActionTileContent
        icon={icon}
        title={title}
        subtitle={subtitle}
        bubbleClassName={bubbleClassName}
        iconClassName={iconClassName}
      />
    </Link>
  );
}

export function DashboardQuickActions({
  role,
  activeVisitorsCount,
  pendingPackagesCount,
  availableAreasCount,
  defaultAreaId,
}: DashboardQuickActionsProps) {
  const isResident = role === "resident";
  const canCreateResident = role === "admin" || role === "staff" || role === "master";
  const canCreateArea = role === "admin" || role === "staff" || role === "master";

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {canCreateResident ? (
          <AddResidentModal
            trigger={
              <ActionTile
                icon={Users}
                title="Cadastrar morador"
                subtitle="Abrir formulário completo"
                bubbleClassName="bg-indigo-500/20 group-hover:bg-indigo-600 dark:bg-indigo-500/25 dark:group-hover:bg-indigo-500"
                iconClassName="text-indigo-600"
              />
            }
          />
        ) : isResident ? (
          <ActionLinkTile
            to="/profile"
            icon={User}
            title="Meu perfil"
            subtitle="Atualizar dados pessoais e contato"
            bubbleClassName="bg-violet-500/20 group-hover:bg-violet-600 dark:bg-violet-500/25 dark:group-hover:bg-violet-500"
            iconClassName="text-violet-600"
          />
        ) : null}

        <AddVisitorModal
          trigger={
            <ActionTile
              icon={UserPlus}
              title="Cadastrar visitante"
              subtitle={
                activeVisitorsCount > 0
                  ? `${activeVisitorsCount} visitantes ativos agora`
                  : "Registrar nova visita rapidamente"
              }
              bubbleClassName="bg-emerald-500/20 group-hover:bg-emerald-600 dark:bg-emerald-500/25 dark:group-hover:bg-emerald-500"
              iconClassName="text-emerald-600"
            />
          }
        />

        {isResident ? (
          defaultAreaId ? (
            <ScheduleModal
              areaId={defaultAreaId}
              status="available"
              trigger={
                <ActionTile
                  icon={CalendarDays}
                  title="Novo agendamento"
                  subtitle={`${availableAreasCount} áreas disponíveis`}
                  bubbleClassName="bg-amber-500/20 group-hover:bg-amber-600 dark:bg-amber-500/25 dark:group-hover:bg-amber-500"
                  iconClassName="text-amber-600"
                />
              }
            />
          ) : (
            <ActionTile
              icon={CalendarDays}
              title="Novo agendamento"
              subtitle="Não há áreas disponíveis no momento"
              disabled
              bubbleClassName="bg-slate-400/20 group-hover:bg-slate-500 dark:bg-slate-500/20 dark:group-hover:bg-slate-500"
              iconClassName="text-slate-500"
            />
          )
        ) : canCreateArea ? (
          <AddAreaModal
            trigger={
              <ActionTile
                icon={Volleyball}
                title="Nova área de lazer"
                subtitle="Cadastrar local e horário de funcionamento"
                bubbleClassName="bg-amber-500/20 group-hover:bg-amber-600 dark:bg-amber-500/25 dark:group-hover:bg-amber-500"
                iconClassName="text-amber-600"
              />
            }
          />
        ) : null}

        <ActionLinkTile
          to="/packages?status=pending"
          icon={Package}
          title={
            pendingPackagesCount > 0
              ? `${pendingPackagesCount} encomendas pendentes`
              : "Encomendas pendentes"
          }
          subtitle={
            pendingPackagesCount > 0
              ? "Abrir lista para acompanhamento"
              : "Sem pendências agora, ver histórico"
          }
          bubbleClassName="bg-sky-500/20 group-hover:bg-sky-600 dark:bg-sky-500/25 dark:group-hover:bg-sky-500"
          iconClassName="text-sky-600"
        />
    </div>
  );
}

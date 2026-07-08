"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAssignRole,
  useRemoveRole,
  useRoles,
  useSetUserStatus,
  useUsers,
} from "../hooks/use-admin";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  gestor: "Gestor",
  consultor: "Consultor",
  secretaria: "Secretária",
  parceiro: "Parceiro",
};

export function UserTable() {
  const { data: users, isLoading } = useUsers();
  const { data: roles } = useRoles();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();
  const setStatus = useSetUserStatus();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  function handleAssign(userId: string, roleId: string) {
    setPendingUserId(userId);
    assignRole.mutate(
      { userId, roleId },
      {
        onError: (error) => toast.error(error.message),
        onSettled: () => setPendingUserId(null),
      },
    );
  }

  function handleRemove(userId: string, roleId: string, roleName: string) {
    setPendingUserId(userId);
    removeRole.mutate(
      { userId, roleId, roleName },
      {
        onError: (error) => toast.error(error.message),
        onSettled: () => setPendingUserId(null),
      },
    );
  }

  function handleToggleStatus(userId: string, current: "active" | "inactive") {
    setPendingUserId(userId);
    setStatus.mutate(
      { userId, status: current === "active" ? "inactive" : "active" },
      {
        onError: (error) => toast.error(error.message),
        onSettled: () => setPendingUserId(null),
      },
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Papéis</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users?.map((user) => {
          const availableRoles = (roles ?? []).filter((role) => !user.roles.includes(role.name));
          const isPending = pendingUserId === user.id;

          return (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.fullName}</TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center gap-1.5">
                  {user.roles.map((roleName) => {
                    const role = roles?.find((r) => r.name === roleName);
                    return (
                      <Badge key={roleName} variant="secondary" className="gap-1 pr-1">
                        {ROLE_LABELS[roleName] ?? roleName}
                        {role && (
                          <button
                            type="button"
                            aria-label={`Remover papel ${roleName}`}
                            disabled={isPending}
                            onClick={() => handleRemove(user.id, role.id, roleName)}
                            className="rounded-full hover:bg-muted-foreground/20"
                          >
                            <X className="size-3" />
                          </button>
                        )}
                      </Badge>
                    );
                  })}
                  {availableRoles.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          disabled={isPending}
                          aria-label={`Adicionar papel para ${user.fullName}`}
                        >
                          <Plus className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {availableRoles.map((role) => (
                          <DropdownMenuItem key={role.id} onSelect={() => handleAssign(user.id, role.id)}>
                            {ROLE_LABELS[role.name] ?? role.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={user.status === "active" ? "default" : "outline"}>
                  {user.status === "active" ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleToggleStatus(user.id, user.status)}
                >
                  {user.status === "active" ? "Desativar" : "Ativar"}
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

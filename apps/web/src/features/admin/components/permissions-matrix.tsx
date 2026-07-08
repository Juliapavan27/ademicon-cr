"use client";

import { Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePermissionMatrix } from "../hooks/use-admin";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  gestor: "Gestor",
  consultor: "Consultor",
  secretaria: "Secretária",
  parceiro: "Parceiro",
};

export function PermissionsMatrix() {
  const { data, isLoading } = usePermissionMatrix();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const grantSet = new Set(data.grants.map((g) => `${g.roleId}:${g.permissionId}`));

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Recurso</TableHead>
            <TableHead>Ação</TableHead>
            {data.roles.map((role) => (
              <TableHead key={role.id} className="text-center">
                {ROLE_LABELS[role.name] ?? role.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.permissions.map((permission) => (
            <TableRow key={permission.id}>
              <TableCell className="font-medium">{permission.resource}</TableCell>
              <TableCell className="text-muted-foreground">{permission.action}</TableCell>
              {data.roles.map((role) => (
                <TableCell key={role.id} className="text-center">
                  {grantSet.has(`${role.id}:${permission.id}`) && (
                    <Check className="mx-auto size-4 text-success" />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

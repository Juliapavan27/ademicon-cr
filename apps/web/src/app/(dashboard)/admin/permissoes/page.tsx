import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PermissionsMatrix } from "@/features/admin/components/permissions-matrix";

export default function AdminPermissoesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissões</CardTitle>
      </CardHeader>
      <CardContent>
        <PermissionsMatrix />
      </CardContent>
    </Card>
  );
}

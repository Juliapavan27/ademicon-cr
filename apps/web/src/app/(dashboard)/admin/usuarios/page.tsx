import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteUserDialog } from "@/features/admin/components/invite-user-dialog";
import { UserTable } from "@/features/admin/components/user-table";

export default function AdminUsuariosPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Usuários</CardTitle>
        <InviteUserDialog />
      </CardHeader>
      <CardContent>
        <UserTable />
      </CardContent>
    </Card>
  );
}
